import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { CSPProjectFile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Download, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const generateAcademicYears = () => {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let i = currentYear + 1; i >= currentYear - 10; i--) {
    years.push(`${i - 1}-${i}`);
  }
  return years;
};

interface ViewCSPProjectsProps {
  allowedRoles: ('student' | 'faculty' | 'librarian')[];
}

const ViewCSPProjects = ({ allowedRoles }: ViewCSPProjectsProps) => {
  const [files, setFiles] = useState<CSPProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedFile, setSelectedFile] = useState<CSPProjectFile | null>(null);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const academicYears = generateAcademicYears();

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('csp_project_files')
        .select('*')
        .order('academic_year', { ascending: false });
      
      if (error) throw error;
      setFiles((data as CSPProjectFile[]) || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch CSP project files',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      const file = files.find(f => f.academic_year === selectedYear);
      setSelectedFile(file || null);
    } else {
      setSelectedFile(null);
    }
  }, [selectedYear, files]);

  const handleDownload = async () => {
    if (!selectedFile) return;
    setDownloading(true);

    try {
      const { data, error } = await supabase.storage
        .from('csp-files')
        .download(selectedFile.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({ title: 'Success', description: 'File downloaded successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to download file', variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={allowedRoles}>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">CSP Project Titles</h1>
          <p className="text-muted-foreground mt-1">View and download CSP project title documents</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Select Academic Year
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an academic year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedYear && (
                <div className="pt-4">
                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{selectedFile.file_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Uploaded on {new Date(selectedFile.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button onClick={handleDownload} disabled={downloading} className="w-full">
                        {downloading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        Download Document
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800 dark:text-amber-200">
                            No File Available
                          </p>
                          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            CSP project titles are not available for the selected academic year ({selectedYear}).
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ViewCSPProjects;