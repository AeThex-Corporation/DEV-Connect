import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateReport, getUserReports } from '@/lib/db_analytics';
import { FileText, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const ReportsGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('earnings');
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    if (user) fetchReports();
  }, [user]);

  const fetchReports = async () => {
    setLoading(true);
    try {
        const data = await getUserReports(user.id);
        setReports(data || []);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const handleGenerate = async () => {
      try {
          const newReport = await generateReport(user.id, type, period);
          setReports([newReport, ...reports]);
          toast({ title: "Report Generated", description: "Your report is ready for download." });
      } catch (error) {
          console.error("Error generating report:", error);
          toast({ title: "Error", description: "Failed to generate report.", variant: "destructive" });
      }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <h1 className="text-3xl font-bold text-white mb-8">Reports Center</h1>

      <Card className="bg-gray-900 border-gray-800 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="w-5 h-5 text-blue-500" /> Generate New Report
          </CardTitle>
          <CardDescription>Select criteria to generate a custom PDF/CSV report.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/3 space-y-2">
            <label className="text-sm text-gray-400">Report Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="earnings">Earnings Statement</SelectItem>
                <SelectItem value="activity">Activity Log</SelectItem>
                <SelectItem value="performance">Performance Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-1/3 space-y-2">
            <label className="text-sm text-gray-400">Time Period</label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="weekly">Last 7 Days</SelectItem>
                <SelectItem value="monthly">Last 30 Days</SelectItem>
                <SelectItem value="yearly">Year to Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-1/3">
            <Button onClick={handleGenerate} className="w-full bg-blue-600 hover:bg-blue-500 gap-2">
               <RefreshCw className="w-4 h-4" /> Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
              <CardTitle className="text-white">Generated Reports</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
              <Table>
                  <TableHeader>
                      <TableRow className="border-gray-800 hover:bg-transparent">
                          <TableHead className="text-gray-300">Date Generated</TableHead>
                          <TableHead className="text-gray-300">Type</TableHead>
                          <TableHead className="text-gray-300">Period</TableHead>
                          <TableHead className="text-right text-gray-300">Action</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {loading ? (
                          <TableRow>
                              <TableCell colSpan={4} className="text-center py-8 text-gray-500">Loading reports...</TableCell>
                          </TableRow>
                      ) : reports.length === 0 ? (
                          <TableRow>
                              <TableCell colSpan={4} className="text-center py-8 text-gray-500">No reports generated yet.</TableCell>
                          </TableRow>
                      ) : (
                          reports.map(report => (
                              <TableRow key={report.id} className="border-gray-800 hover:bg-gray-800/30">
                                  <TableCell className="text-gray-300">{new Date(report.generated_at).toLocaleDateString()}</TableCell>
                                  <TableCell className="text-white capitalize font-medium">{report.report_type}</TableCell>
                                  <TableCell className="text-gray-400 capitalize">{report.period}</TableCell>
                                  <TableCell className="text-right">
                                      <Button size="sm" variant="outline" className="border-gray-700 hover:bg-gray-800 text-gray-300">
                                          <Download className="w-4 h-4 mr-2" /> Download PDF
                                      </Button>
                                  </TableCell>
                              </TableRow>
                          ))
                      )}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>
    </div>
  );
};

export default ReportsGenerator;