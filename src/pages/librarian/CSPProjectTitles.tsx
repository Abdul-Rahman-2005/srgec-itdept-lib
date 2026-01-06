import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { CSPProjectFile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, FileText, Trash2, Download, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';

const generateAcademicYears = () => {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let i = currentYear + 1; i >= currentYear - 10; i--) {
    years.push(`${i - 1}-${i}`);
  }
  return years;
};

const CSPProjectTitles = () => {
  const [files, setFiles] = useState<CSPProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteFile, setDeleteFile] = useState<CSPProjectFile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [replaceConfirmOpen, setReplaceConfirmOpen] = useState(false);
  const [existingFileForYear, setExistingFileForYear] = useState<CSPProjectFile | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
        toast({ title: 'Error', description: 'Please upload a Word document (.doc or .docx)', variant: 'destructive' });
        return;
      }
      setUploadFile(file);
    }
  };

  const checkExistingFile = () => {
    const existing = files.find(f => f.academic_year === selectedYear);
    if (existing) {
      setExistingFileForYear(existing);
      setReplaceConfirmOpen(true);
    } else {
      handleUpload();
    }
  };

  const handleUpload = async (replace = false) => {
    if (!selectedYear || !uploadFile || !user) {
      toast({ title: 'Error', description: 'Please select an academic year and file', variant: 'destructive' });
      return;
    }

    setActionLoading(true);
    setReplaceConfirmOpen(false);

    try {
      // If replacing, delete old file first
      if (replace && existingFileForYear) {
        await supabase.storage.from('csp-files').remove([existingFileForYear.file_path]);
        await supabase.from('csp_project_files').delete().eq('id', existingFileForYear.id);
      }

      // Upload new file
      const filePath = `${selectedYear}/${Date.now()}_${uploadFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('csp-files')
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      // Save record
      const { error: dbError } = await supabase.from('csp_project_files').insert({
        academic_year: selectedYear,
        file_name: uploadFile.name,
        file_path: filePath,
        uploaded_by: user.id,
      });

      if (dbError) throw dbError;

      toast({ title: 'Success', description: 'CSP project file uploaded successfully' });
      setUploadDialogOpen(false);
      setSelectedYear('');
      setUploadFile(null);
      setExistingFileForYear(null);
      fetchFiles();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to upload file', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async (file: CSPProjectFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('csp-files')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to download file', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteFile) return;
    setActionLoading(true);

    try {
      await supabase.storage.from('csp-files').remove([deleteFile.file_path]);
      const { error } = await supabase.from('csp_project_files').delete().eq('id', deleteFile.id);
      if (error) throw error;

      toast({ title: 'Success', description: 'File deleted successfully' });
      setDeleteFile(null);
      fetchFiles();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete file', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['librarian']}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">CSP Project Titles</h1>
            <p className="text-muted-foreground mt-1">Upload and manage CSP project title documents by academic year</p>
          </div>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : files.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="font-serif text-xl font-semibold mb-2">No Files Uploaded</h2>
              <p className="text-muted-foreground">Upload CSP project title documents for each academic year.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {files.map((file) => (
              <Card key={file.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-lg">Academic Year: {file.academic_year}</h3>
                      <p className="text-sm text-muted-foreground truncate">{file.file_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploaded on {new Date(file.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="icon" onClick={() => handleDownload(file)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => setDeleteFile(file)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload CSP Project Titles</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Academic Year *</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Word Document (.docx) *</Label>
                <Input type="file" accept=".doc,.docx" onChange={handleFileChange} />
                {uploadFile && (
                  <p className="text-sm text-muted-foreground">Selected: {uploadFile.name}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
              <Button onClick={checkExistingFile} disabled={actionLoading || !selectedYear || !uploadFile}>
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Replace Confirmation Dialog */}
        <Dialog open={replaceConfirmOpen} onOpenChange={setReplaceConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                File Already Exists
              </DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              A file already exists for academic year {selectedYear}. Do you want to replace it?
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReplaceConfirmOpen(false)}>Cancel</Button>
              <Button onClick={() => handleUpload(true)} disabled={actionLoading}>
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Replace
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={!!deleteFile} onOpenChange={() => setDeleteFile(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete File</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Are you sure you want to delete the CSP project file for {deleteFile?.academic_year}? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteFile(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CSPProjectTitles;