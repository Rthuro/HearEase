import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { renderAsync } from 'docx-preview';
import { 
  Save, FileText, Trash2, Upload, ChevronLeft, 
  AlertCircle, CheckCircle2, Loader2, 
  FileEdit, Copy, Info,  FileCheck,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useGenerateDocumentStore } from '@/store/useGenerateDocumentStore';
import { toast } from 'react-hot-toast';
import { PreviewDocx } from '@/components/PreviewDocx';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api/templates/";
const API_BASE_CREATE = import.meta.env.VITE_API_URL || "http://localhost:8000/api/document-templates/";

const PLACEHOLDER_GROUPS = [
  {
    title: "Case Identification",
    items: [
      { tag: "{{ case_number }}", desc: "Unique ID of the case" },
      { tag: "{{ nature_of_complaint }}", desc: "Case category/name" },
      { tag: "{{ severity }}", desc: "Case severity level" },
      { tag: "{{ case_status }}", desc: "Case status (e.g. In progress, Settled)" },
      { tag: "{{ description }}", desc: "Case description" },
      { tag: "{{ cfa_destination }}", desc: "Certificate of file to action destination (CFA)" },
      { tag: "{{ case_completed }}", desc: "Case completion date" },
      { tag: "{{ approved_case_date }}", desc: "Case approved date" },
      { tag: "{{ rejected_case_date }}", desc: "Case rejected date" },
      { tag: "{{ remarks }}", desc: "Case remarks" },
    ]
  },
   {
    title: "Summon Information",
    items: [
      { tag: "{{ summon_date_received }}", desc: "Date the summons was received" },
      { tag: "{{ summon_received_by }}", desc: "Person who received the summons" },
      { tag: "{{ summon_status }}", desc: "Status of the summons (e.g. Received, Pending)" },
      { tag: "{{ summon_hearing_date }}", desc: "Scheduled date of the first hearing" },
      { tag: "{{ summon_hearing_time }}", desc: "Scheduled time of the first hearing" },
      { tag: "{{ summon_hearing_lupon }}", desc: "Assigned lupon of the first hearing" },
    ]
  },
  {
    title: "Detailed Dates",
    items: [
      { tag: "{{ date_filed }}", desc: "Full date filed" },
      { tag: "{{ date }}", desc: "Current day number (e.g. 15)" },
      { tag: "{{ month }}", desc: "Current month name (e.g. October)" },
      { tag: "{{ year }}", desc: "Current year (e.g. 2024)" },
    ]
  },
  {
    title: "Parties (Complainant/Respondent)",
    items: [
      { tag: "{{ complainants }}", desc: "List of all complainants" },
      { tag: "{{ respondents }}", desc: "List of all respondents" },
      { tag: "{{ name }}", desc: "Used in No-Show: Specific person name" },
      { tag: "{{ address }}", desc: "Used in No-Show: Specific person address" },
    ]
  },
  {
    title: "Official Signatories",
    items: [
      { tag: "{{ punong_barangay }}", desc: "Name of Barangay Captain" },
      { tag: "{{ lupon_member }}", desc: "Presiding Lupon member" },
      { tag: "{{ lupon_secretary }}", desc: "The Lupon Secretary" },
    ]
  },
  {
    title: "Hearing Details",
    items: [
      { tag: "{{ hearings }}", desc: "List of all hearings for the case" },
      { tag: "{{ hearing_date }}", desc: "Scheduled date of hearing" },
      { tag: "{{ time }}", desc: "Scheduled time of hearing" },
    ]
  }
];

export function TemplateEditor() {
  const { templates, fetchTemplates} = useGenerateDocumentStore();
  const { templateId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const previewContainerRef = useRef(null);

  const [name, setName] = useState('');
  const [templateType, setTemplateType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); 
  const [previewBlob, setPreviewBlob] = useState(null);  
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect( () => {
    if (templateId) {
      const template_data = templates.find(t => t.id === parseInt(templateId));
      setLoading(true);
      setName(template_data?.name || '');
      setTemplateType(template_data?.template_type || '');
      if (template_data?.docx_file) {
        const fileRes = axios.get(template_data.docx_file, { responseType: 'blob' });
        fileRes.then(res => {
          setPreviewBlob(res.data)
          setSelectedFile(new File([res.data], template_data.name + ".docx", { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
        });
      }
      setLoading(false);
    }
  }, [templateId]);

  // 2. Handle docx-preview rendering
  useEffect(() => {
    if (previewBlob && previewContainerRef.current) {
      previewContainerRef.current.innerHTML = ""; // Clear previous
      renderAsync(previewBlob, previewContainerRef.current)
        .catch(err => console.error("Preview error:", err));
    }
  }, [previewBlob]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewBlob(file); // docx-preview can take a File object directly
    }
  };

  const handleSave = async () => {
    if (!name || (!selectedFile && !templateId)) {
      setStatusMsg({ type: 'error', text: 'Please provide a name and a .docx file.' });
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('template_type', templateType);
    if (selectedFile) {
      formData.append('docx_file', selectedFile);
    }

    setLoading(true);
    try {
      if (templateId) {
        await axios.put(`${API_BASE}${templateId}/`, formData);
        setStatusMsg({ type: 'success', text: 'Template updated successfully!' });
      } else {
        await axios.post(API_BASE_CREATE, formData);
        fetchTemplates();
        navigate(`/Admin/Generate-Documents`);
        setStatusMsg({ type: 'success', text: 'Template created!' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Save failed. Check backend configuration.' });
    } finally {
      setLoading(false);
      setName('');
      setTemplateType('');
      setSelectedFile(null);
    }
  };

  const handleDelete = async () => {
    try {
      await toast.promise(
        axios.delete(`${API_BASE}${templateId}/`),
        { 
          loading: 'Deleting template...',
          success: 'Template deleted!',
          error: 'Delete failed.'
        }
      );
      navigate('/Admin/Generate-Documents');
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Delete failed.' });
    } finally {
      setDeleteModal(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${text}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/Admin/Generate-Documents')} className="p-2 hover:bg-white rounded-full transition">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {templateId ? 'Update Template' : 'Add New Docx Template'}
          </h1>
        </div>

        <div className="flex gap-3">
          {templateId && (
            <button 
              onClick={() => setDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <Trash2 size={18} /> Delete
            </button>
          )}
          <div className="flex items-center gap-2">
            <Dialog>
               <DialogTrigger className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition" asChild>
                  <Button variant="outline" size={'sm'} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                    <FileEdit size={18} /> Edit Template
                  </Button>
               </DialogTrigger>
               <DialogContent className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <DialogHeader>
                    <DialogTitle>Select Template</DialogTitle>
                    <DialogDescription>
                      Choose an existing template to load its content for editing. This will overwrite any unsaved changes.
                    </DialogDescription>
                    <div className="flex flex-col gap-2 mt-3">
                      {templates.map(t => (
                        <Link to={`/Admin/Template-Editor/${t.id}`} key={t.id} className="px-4 py-2 rounded-lg hover:bg-gray-100 transition border ">
                          <FileText size={16} className="inline-block mr-2" />
                          {t.name} ({t.template_type})
                        </Link>
                      ))}
                    </div>
                  </DialogHeader>
              </DialogContent>
            </Dialog>
            <Button 
              onClick={handleSave}
              disabled={loading}
              size={'sm'}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 transition shadow-lg shadow-red-200"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {templateId ? 'Update Template' : 'Save Template'}
            </Button>
          </div>
          
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Left Side: Controls */}
        <div className="xl:col-span-4 space-y-6">
          {statusMsg.text && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${statusMsg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {statusMsg.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle2 size={20}/>}
              {statusMsg.text}
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Template Name</label>
              <input 
                type="text" 
                className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Notice of Hearing"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Template Type / Code</label>
              <input 
                type="text" 
                className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
                placeholder="e.g., summon, no_show"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Word Template (.docx)</label>
              <div 
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center gap-1 justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition group"
              >
                {selectedFile ? <FileCheck size={24} className="text-green-600" /> : <Upload size={48} className="text-gray-400" />}
                <span className={`text-sm font-medium ${selectedFile ? 'text-green-600' : 'text-gray-600 '} `}>
                  {selectedFile ? selectedFile.name : 'Click to upload or drag & drop'}
                </span>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".docx" 
              />
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-amber-800">
              <AlertTriangle size={20} />
              <h3 className="font-bold text-lg">Admin Template Guide</h3>
            </div>
            
            <p className="text-sm text-amber-700 mb-4 leading-relaxed">
              When creating your <strong>.docx</strong> file, you must use the tags with <strong>double brackets</strong>, check default placeholders below. 
              Formatting (Bold, Color, Font Size) applied to these tags in Word will be preserved.
            </p>

            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
              {PLACEHOLDER_GROUPS.map((group, idx) => (
                <div key={idx}>
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 mb-2">{group.title}</h4>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <div 
                        key={item.tag} 
                        onClick={() => copyToClipboard(item.tag)}
                        className="flex items-center justify-between p-2 bg-white rounded-md border border-amber-200 hover:border-amber-400 cursor-pointer transition group w-fit gap-4"
                      >
                        <div className="flex flex-col">
                          <code className="text-blue-700 font-bold text-sm">{item.tag}</code>
                          <span className="text-[10px] text-gray-500 italic">{item.desc}</span>
                        </div>
                        <Copy size={14} className="text-gray-500 group-hover:text-amber-600" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* <div className="bg-amber-100 p-3 rounded-lg border border-amber-200">
                <h4 className="text-xs font-bold text-amber-900 mb-1">Advanced: Hearing Tables</h4>
                <p className="text-[11px] text-amber-800">To list all hearings in a table, use this logic in a Word table row:</p>
                <code className="block text-[10px] mt-1 bg-white p-1 rounded font-mono">
                  {`{% for h in hearings %}`} <br/>
                  {`{{ h.date }} | {{ h.status }}`} <br/>
                  {`{% endfor %}`}
                </code>
              </div> */}

            </div>
        </div>
        
        <PreviewDocx blob={previewBlob} blobRef={previewContainerRef} />
        
      </div>

      {deleteModal && (
        <Dialog open={deleteModal} onOpenChange={setDeleteModal}>
          <DialogContent className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{name}</strong> template? This action cannot be undone.
              </DialogDescription>
              <div className="flex gap-4 mt-3">
                <Button className="flex-1" variant="outline" onClick={() => setDeleteModal(false)}>Cancel</Button>
                <Button className="flex-1" variant="destructive" onClick={handleDelete}>Delete</Button>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}