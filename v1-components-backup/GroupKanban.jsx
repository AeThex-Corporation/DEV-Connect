import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Plus,
  MoreVertical,
  User,
  Calendar,
  Flag,
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight
} from "lucide-react";

export default function GroupKanban({ groupId, user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("todo");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    estimated_hours: 0
  });
  const [draggedTask, setDraggedTask] = useState(null);

  const columns = [
    { id: "todo", title: "To Do", icon: Circle, color: "text-gray-400" },
    { id: "in_progress", title: "In Progress", icon: ArrowRight, color: "text-blue-400" },
    { id: "review", title: "Review", icon: Clock, color: "text-yellow-400" },
    { id: "done", title: "Done", icon: CheckCircle2, color: "text-green-400" }
  ];

  useEffect(() => {
    if (groupId) {
      loadTasks();
    }
  }, [groupId]);

  const loadTasks = async () => {
    try {
      const allTasks = await base44.entities.CollabTask.filter({ room_id: groupId });
      setTasks(allTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      await base44.entities.CollabTask.create({
        room_id: groupId,
        title: newTask.title,
        description: newTask.description,
        status: selectedColumn,
        priority: newTask.priority,
        due_date: newTask.due_date || undefined,
        estimated_hours: newTask.estimated_hours || undefined,
        created_by: user.id,
        assigned_to: user.id
      });

      // Award points for creating task
      const currentPoints = user.community_points || 0;
      await base44.auth.updateMe({ 
        community_points: currentPoints + 5 
      });

      setCreateModalOpen(false);
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
        estimated_hours: 0
      });
      loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (columnId) => {
    if (!draggedTask) return;

    try {
      await base44.entities.CollabTask.update(draggedTask.id, {
        status: columnId
      });

      // Award points for completing task
      if (columnId === 'done' && draggedTask.status !== 'done') {
        const currentPoints = user.community_points || 0;
        await base44.auth.updateMe({ 
          community_points: currentPoints + 15 
        });

        await base44.entities.CommunityContribution.create({
          user_id: user.id,
          contribution_type: 'group_project',
          points_earned: 15,
          related_entity_id: groupId,
          related_entity_type: 'group'
        });
      }

      loadTasks();
      setDraggedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-500/20 text-blue-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      high: 'bg-orange-500/20 text-orange-400',
      urgent: 'bg-red-500/20 text-red-400'
    };
    return colors[priority] || colors.medium;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Task Board</h3>
        <Button
          onClick={() => {
            setSelectedColumn("todo");
            setCreateModalOpen(true);
          }}
          size="sm"
          className="btn-primary text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-4">
        {columns.map((column) => {
          const Icon = column.icon;
          const columnTasks = tasks.filter(t => t.status === column.id);

          return (
            <div
              key={column.id}
              className="glass-card rounded-lg p-4"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${column.color}`} />
                  <h4 className="text-white font-medium text-sm">{column.title}</h4>
                  <Badge className="bg-white/5 text-gray-300 border-0 text-xs">
                    {columnTasks.length}
                  </Badge>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => {
                    setSelectedColumn(column.id);
                    setCreateModalOpen(true);
                  }}
                >
                  <Plus className="w-3 h-3 text-gray-400" />
                </Button>
              </div>

              <div className="space-y-3 min-h-[400px]">
                {columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    className="glass-card border-0 cursor-move card-hover"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="text-white font-medium text-sm flex-1">
                          {task.title}
                        </h5>
                        <Button size="icon" variant="ghost" className="h-5 w-5">
                          <MoreVertical className="w-3 h-3 text-gray-400" />
                        </Button>
                      </div>

                      {task.description && (
                        <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${getPriorityColor(task.priority)} border-0 text-xs`}>
                          <Flag className="w-2 h-2 mr-1" />
                          {task.priority}
                        </Badge>
                        {task.estimated_hours && (
                          <Badge className="bg-white/5 text-gray-300 border-0 text-xs">
                            <Clock className="w-2 h-2 mr-1" />
                            {task.estimated_hours}h
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        {task.due_date && (
                          <div className="flex items-center text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}
                        {task.assigned_to && (
                          <div className="flex items-center text-gray-500">
                            <User className="w-3 h-3 mr-1" />
                            {task.assigned_to.slice(-6)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="glass-card border-0">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Task Title *</label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Add details about the task"
                className="bg-white/5 border-white/10 text-white h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Due Date</label>
                <Input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">Estimated Hours</label>
              <Input
                type="number"
                value={newTask.estimated_hours}
                onChange={(e) => setNewTask({ ...newTask, estimated_hours: parseInt(e.target.value) })}
                placeholder="0"
                min="0"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setCreateModalOpen(false)}
                variant="outline"
                className="flex-1 glass-card border-0 text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTask}
                className="flex-1 btn-primary text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}