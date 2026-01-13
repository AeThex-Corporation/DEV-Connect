import React, { useState, useEffect } from 'react';
    import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
      DialogFooter,
    } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

    const EditCollectiveDialog = ({ open, onOpenChange, collective, onCollectiveUpdate }) => {
      const { toast } = useToast();
      const [name, setName] = useState('');
      const [description, setDescription] = useState('');
      const [isRecruiting, setIsRecruiting] = useState(false);
      const [recruitingRoles, setRecruitingRoles] = useState('');
      const [associatedStudioId, setAssociatedStudioId] = useState('');
      const [userStudios, setUserStudios] = useState([]);
      const [loading, setLoading] = useState(false);

      useEffect(() => {
        const fetchUserStudios = async () => {
          if (collective?.owner_id) {
            const { data, error } = await supabase
              .from('studios')
              .select('id, name')
              .eq('type', 'studio')
              .eq('owner_id', collective.owner_id);
            if (error) {
              toast({ variant: 'destructive', title: 'Error fetching studios' });
            } else {
              setUserStudios(data);
            }
          }
        };

        if (open && collective) {
          fetchUserStudios();
          setName(collective.name || '');
          setDescription(collective.description || '');
          setIsRecruiting(collective.is_recruiting || false);
          setRecruitingRoles((collective.recruiting_roles || []).join(', '));
          setAssociatedStudioId(collective.associated_studio_id || '');
        }
      }, [collective, open, toast]);

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const rolesArray = recruitingRoles.split(',').map(role => role.trim()).filter(Boolean);

        const { error } = await supabase
          .from('studios')
          .update({ 
            name, 
            description,
            is_recruiting: isRecruiting,
            recruiting_roles: rolesArray,
            associated_studio_id: associatedStudioId || null,
          })
          .eq('id', collective.id);

        setLoading(false);

        if (error) {
          toast({
            variant: 'destructive',
            title: 'Error updating collective',
            description: error.message,
          });
        } else {
          toast({
            title: 'Collective Updated!',
            description: 'Your collective details have been saved.',
          });
          onCollectiveUpdate();
          onOpenChange(false);
        }
      };

      if (!collective) {
        return null;
      }

      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Collective</DialogTitle>
              <DialogDescription>
                Update your collective's public information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="collective-name">Collective Name</Label>
                <Input id="collective-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your awesome collective name" />
              </div>
              <div>
                <Label htmlFor="collective-description">Description</Label>
                <Textarea id="collective-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell everyone what your collective is about." />
              </div>
              <div>
                <Label htmlFor="associated-studio">Associated Studio</Label>
                <Select value={associatedStudioId} onValueChange={setAssociatedStudioId}>
                    <SelectTrigger>
                        <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {userStudios.map(studio => (
                            <SelectItem key={studio.id} value={studio.id}>{studio.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Link this collective to one of your studios.</p>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    };

    export default EditCollectiveDialog;