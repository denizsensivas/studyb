import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Layout from '../design-system/Layout';
import Card from '../design-system/Card';
import Button from '../design-system/Button';
import Input from '../design-system/Input';
import { documentAPI } from '../services/api';

interface StudyDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

interface StorageUsage {
  usedBytes: number;
  limitBytes: number;
  remainingBytes: number;
  usagePercent: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/epub+zip',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

function uploadErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error || 'Dosya yüklenirken bir hata oluştu.';
  }
  return 'Dosya yüklenirken bir hata oluştu.';
}

function formatStorageBytes(bytes: number) {
  if (bytes >= 1_000_000_000) return `${parseFloat((bytes / 1_000_000_000).toFixed(2))} GB`;
  if (bytes >= 1_000_000) return `${parseFloat((bytes / 1_000_000).toFixed(2))} MB`;
  if (bytes >= 1_000) return `${parseFloat((bytes / 1_000).toFixed(2))} KB`;
  return `${bytes} Bytes`;
}

export default function NotesPage() {
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileTitle, setFileTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const [documentsResponse, storageResponse] = await Promise.all([
        documentAPI.getAll(),
        documentAPI.getStorageUsage(),
      ]);
      setDocuments(documentsResponse.data);
      setStorageUsage(storageResponse.data);
    } catch {
      setError('Dosyalar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const selectFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setError('Dosya boyutu 10 MB sınırını aşamaz.');
      return;
    }

    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      setSelectedFile(null);
      setError('Bu dosya türü desteklenmiyor.');
      return;
    }

    if (storageUsage && file.size > storageUsage.remainingBytes) {
      setSelectedFile(null);
      setError('Paylaşılan bulut alanında bu dosya için yeterli yer yok.');
      return;
    }

    setSelectedFile(file);
    setError('');
    if (!fileTitle) {
      setFileTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) selectFile(e.target.files[0]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) selectFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Lütfen yüklemek için bir dosya seçin.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const res = await documentAPI.upload(selectedFile, fileTitle);
      setDocuments((currentDocuments) => [res.data, ...currentDocuments]);
      setStorageUsage((currentUsage) => {
        if (!currentUsage) return currentUsage;
        const usedBytes = currentUsage.usedBytes + res.data.fileSize;
        return {
          ...currentUsage,
          usedBytes,
          remainingBytes: Math.max(0, currentUsage.limitBytes - usedBytes),
          usagePercent: Math.min(100, Number(((usedBytes / currentUsage.limitBytes) * 100).toFixed(2))),
        };
      });
      setSelectedFile(null);
      setFileTitle('');
      setSuccess('Dosyanız güvenli bulut alanına yüklendi.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: unknown) {
      setError(uploadErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu dosyayı silmek istediğinize emin misiniz?')) return;

    try {
      const deletedDocument = documents.find((doc) => doc.id === id);
      await documentAPI.delete(id);
      setDocuments((currentDocuments) => currentDocuments.filter((doc) => doc.id !== id));
      if (deletedDocument) {
        setStorageUsage((currentUsage) => {
          if (!currentUsage) return currentUsage;
          const usedBytes = Math.max(0, currentUsage.usedBytes - deletedDocument.fileSize);
          return {
            ...currentUsage,
            usedBytes,
            remainingBytes: currentUsage.limitBytes - usedBytes,
            usagePercent: Number(((usedBytes / currentUsage.limitBytes) * 100).toFixed(2)),
          };
        });
      }
      setSuccess('Dosya silindi.');
    } catch {
      setError('Dosya silinirken bir hata oluştu.');
    }
  };

  const handleAction = async (doc: StudyDocument, actionType: 'view' | 'download') => {
    setError('');
    setSuccess('');
    const previewWindow = actionType === 'view' ? window.open('', '_blank') : null;

    if (actionType === 'view' && !previewWindow) {
      setError('Tarayıcınız yeni sekme açılmasını engelledi. Lütfen izin verin.');
      return;
    }

    try {
      const res = await documentAPI.download(doc.id);
      
      if (!res.data) {
        throw new Error('Dosya içeriği boş.');
      }
      
      const blob = new Blob([res.data], { type: doc.mimeType });
      const url = window.URL.createObjectURL(blob);
      
      if (actionType === 'view') {
        previewWindow!.location.href = url;
        setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', doc.fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      }
    } catch {
      previewWindow?.close();
      setError('Dosya açılırken/indirilirken bir hata oluştu.');
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getFileIcon = (mime: string) => {
    if (mime.includes('pdf')) return '📕';
    if (mime.includes('image')) return '🖼️';
    if (mime.includes('text') || mime.includes('word') || mime.includes('document')) return '📄';
    if (mime.includes('epub') || mime.includes('zip') || mime.includes('book')) return '📘';
    return '📁';
  };

  return (
    <Layout className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-clay-foreground sm:text-5xl" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Notlarım & Belgelerim 📂
          </h1>
          <p className="mt-2 text-lg font-medium text-clay-muted">
            Çalışma kitaplarını, ders notlarını ve e-kitaplarını buraya yükleyebilirsin.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-100 p-4 text-sm font-bold text-red-600">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="rounded-2xl bg-green-100 p-4 text-sm font-bold text-green-600">
            ✅ {success}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Upload Card */}
          <div className="lg:col-span-1">
            <Card hover={false}>
              <h2 className="mb-4 text-xl font-extrabold text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Dosya Yükle
              </h2>
              <div className="mb-5 rounded-[20px] bg-clay-canvas p-4 shadow-clay-pressed" aria-live="polite">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-clay-foreground">Paylaşılan Bulut Alanı</p>
                    <p className="mt-0.5 text-xs font-semibold text-clay-muted">Tüm kullanıcılar için ortak limit</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/70 px-2.5 py-1 text-xs font-extrabold text-clay-accent shadow-sm">
                    9 GB
                  </span>
                </div>
                {storageUsage ? (
                  <>
                    <div
                      className="mt-3 h-3 overflow-hidden rounded-full bg-white/70 shadow-inner"
                      role="progressbar"
                      aria-label="Paylaşılan bulut depolama kullanımı"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={storageUsage.usagePercent}
                    >
                      <div
                        className={`h-full rounded-full transition-[width] duration-500 ${
                          storageUsage.usagePercent >= 90
                            ? 'bg-gradient-to-r from-orange-400 to-red-500'
                            : 'bg-gradient-to-r from-clay-accent to-purple-500'
                        }`}
                        style={{ width: `${storageUsage.usagePercent}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between gap-3 text-xs font-bold text-clay-muted">
                      <span>{formatStorageBytes(storageUsage.usedBytes)} kullanılıyor</span>
                      <span>{formatStorageBytes(storageUsage.remainingBytes)} boş</span>
                    </div>
                  </>
                ) : (
                  <p className="mt-3 text-xs font-bold text-clay-muted">Alan bilgisi yükleniyor…</p>
                )}
              </div>
              <form onSubmit={handleUpload} className="space-y-4">
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed p-6 text-center transition-all duration-300 ${
                    dragActive 
                      ? 'border-clay-accent bg-clay-accent/5 scale-[1.02]' 
                      : 'border-clay-accent/20 bg-clay-canvas shadow-clay-pressed hover:border-clay-accent/40'
                  }`}
                >
                  <span className="text-4xl mb-2">📥</span>
                  <span className="text-sm font-bold text-clay-muted mb-4 block max-w-xs truncate">
                    {selectedFile ? selectedFile.name : 'Dosyaları buraya sürükleyin veya seçin'}
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.doc,.docx,.epub,.ppt,.pptx"
                    className="hidden"
                    id="file-upload-input"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Dosya Seç
                  </Button>
                  <span className="mt-3 text-xs font-bold leading-relaxed text-clay-muted">
                    PDF, görsel, metin, Word, EPUB veya PowerPoint • En fazla 10 MB
                  </span>
                </div>

                <Input
                  label="Not Başlığı (Opsiyonel)"
                  type="text"
                  placeholder="Örn: Almanca Gramer Kitabı"
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                />

                <Button
                  type="submit"
                  fullWidth
                  disabled={uploading || !selectedFile}
                >
                  {uploading ? 'Buluta yükleniyor...' : 'Buluta Yükle'}
                </Button>
              </form>
            </Card>
          </div>

          {/* List Card */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-extrabold text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Yüklediğim Notlar
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-clay-accent border-t-transparent" />
              </div>
            ) : documents.length === 0 ? (
              <Card hover={false} className="py-12 text-center text-clay-muted">
                <span className="text-5xl mb-4 block font-normal animate-pulse">📭</span>
                <p className="font-bold text-lg">Henüz hiç dosya yüklememişsin.</p>
                <p className="text-sm mt-1">Sol taraftaki formdan ilk ders notunu veya kitabını yükleyebilirsin.</p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                {documents.map((doc) => (
                  <Card key={doc.id} className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl p-2 rounded-2xl bg-white shadow-clay-button">
                          {getFileIcon(doc.mimeType)}
                        </span>
                        <div className="overflow-hidden">
                          <h3 className="text-lg font-extrabold text-clay-foreground truncate" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            {doc.title}
                          </h3>
                          <p className="text-xs text-clay-muted truncate">{doc.fileName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-clay-muted mb-4">
                        <span>📊 {formatBytes(doc.fileSize)}</span>
                        <span>📅 {new Date(doc.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 text-xs h-10 rounded-xl px-2"
                        onClick={() => handleAction(doc, 'view')}
                      >
                        👁️ Görüntüle
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 text-xs h-10 rounded-xl px-2"
                        onClick={() => handleAction(doc, 'download')}
                      >
                        📥 İndir
                      </Button>
                      <button
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 border border-red-100 text-red-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-100 active:scale-90"
                        onClick={() => handleDelete(doc.id)}
                        title="Sil"
                      >
                        🗑️
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
