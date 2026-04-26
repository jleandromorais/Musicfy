import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FaArrowLeft, FaUpload, FaTimes, FaSignOutAlt, FaBox, FaTachometerAlt,
} from 'react-icons/fa';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api`;

const CATEGORIES = [
  { value: 'fones', label: 'Fones' },
  { value: 'headsets', label: 'Headsets' },
  { value: 'caixas_som', label: 'Caixas de Som' },
  { value: 'acessorios', label: 'Acessórios' },
];

type FormState = {
  nome: string;
  descricao: string;
  preco: string;
  estoque: string;
  categoria: string;
  is_active: boolean;
};

const EMPTY_FORM: FormState = {
  nome: '',
  descricao: '',
  preco: '',
  estoque: '',
  categoria: 'fones',
  is_active: true,
};

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { adminToken, adminUser, logoutAdmin } = useAdminAuth();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [serverError, setServerError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const authHeaders = { Authorization: `Bearer ${adminToken}` };

  useEffect(() => {
    if (!isEditing) return;
    const load = async () => {
      try {
        const res = await fetch(`${API}/admin/products/?page=1&limit=1000`, { headers: authHeaders });
        if (!res.ok) return;
        const data = await res.json();
        const product = data.products.find((p: any) => p.id === Number(id));
        if (!product) return;
        setForm({
          nome: product.nome,
          descricao: product.descricao ?? '',
          preco: String(product.preco),
          estoque: String(product.estoque),
          categoria: product.categoria,
          is_active: product.is_active,
        });
        if (product.imagem_url) setExistingImage(product.imagem_url);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const urls = selectedFiles.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [selectedFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setSelectedFiles(files);
    setExistingImage(null);
    setImageError(null);
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.nome.trim()) e.nome = 'Nome obrigatório.';
    if (!form.descricao.trim()) e.descricao = 'Descrição obrigatória.';
    if (!form.preco || isNaN(Number(form.preco)) || Number(form.preco) <= 0) e.preco = 'Preço inválido.';
    if (form.estoque === '' || isNaN(Number(form.estoque)) || Number(form.estoque) < 0) e.estoque = 'Estoque inválido.';
    setErrors(e);
    if (!isEditing && selectedFiles.length === 0 && !existingImage) {
      setImageError('Selecione pelo menos uma imagem.');
      return false;
    }
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setImageError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nome', form.nome);
      formData.append('descricao', form.descricao);
      formData.append('preco', form.preco);
      formData.append('estoque', form.estoque);
      formData.append('categoria', form.categoria);
      formData.append('is_active', String(form.is_active));
      if (selectedFiles.length > 0) formData.append('imagem', selectedFiles[0]);

      const url = isEditing ? `${API}/admin/products/${id}` : `${API}/admin/products/`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers: authHeaders, body: formData });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setServerError(errData.detail ?? 'Erro ao salvar produto.');
        return;
      }
      navigate('/admin/dashboard');
    } catch {
      setServerError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof FormState) =>
    `w-full px-4 py-3 bg-gray-800/60 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm ${
      errors[field] ? 'border-red-500' : 'border-gray-700'
    }`;

  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#1A002F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          Carregando produto...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A002F] flex relative overflow-hidden">
      {/* Background glows */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#F14A16] opacity-5 filter blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#35589A] opacity-10 filter blur-3xl pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-60 bg-black/40 backdrop-blur-sm border-r border-white/10 flex flex-col relative z-10">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-extrabold text-white">Musicfy</h1>
          <span className="text-xs font-semibold text-orange-500 tracking-widest uppercase mt-0.5 block">
            Admin Panel
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <FaTachometerAlt /> Dashboard
          </Link>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-orange-600/20 text-orange-400 border border-orange-500/20">
            <FaBox /> Produtos
          </div>
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-orange-600/30 border border-orange-500/30 flex items-center justify-center text-orange-400 text-xs font-bold">
              {adminUser?.nome?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">{adminUser?.nome}</p>
              <p className="text-gray-500 text-xs truncate">{adminUser?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logoutAdmin(); navigate('/admin/login'); }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors"
          >
            <FaSignOutAlt /> Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-auto relative z-10">
        {/* Header */}
        <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <FaArrowLeft />
            </Link>
            <div>
              <h2 className="text-white font-bold text-lg">
                {isEditing ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <p className="text-gray-500 text-xs">
                {isEditing ? 'Atualize as informações do produto' : 'Preencha os dados do novo produto'}
              </p>
            </div>
          </div>
          <span className="text-gray-500 text-sm">Olá, {adminUser?.nome}</span>
        </header>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Nome do Produto <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Fone JBL Pro"
                className={inputClass('nome')}
              />
              {errors.nome && <p className="mt-1 text-xs text-red-400">{errors.nome}</p>}
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Descrição <span className="text-orange-500">*</span>
              </label>
              <textarea
                rows={4}
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Descreva o produto..."
                className={`${inputClass('descricao')} resize-none`}
              />
              {errors.descricao && <p className="mt-1 text-xs text-red-400">{errors.descricao}</p>}
            </div>

            {/* Preço + Estoque */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Preço (R$) <span className="text-orange-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.preco}
                  onChange={(e) => setForm({ ...form, preco: e.target.value })}
                  placeholder="0.00"
                  className={inputClass('preco')}
                />
                {errors.preco && <p className="mt-1 text-xs text-red-400">{errors.preco}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Estoque <span className="text-orange-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.estoque}
                  onChange={(e) => setForm({ ...form, estoque: e.target.value })}
                  placeholder="0"
                  className={inputClass('estoque')}
                />
                {errors.estoque && <p className="mt-1 text-xs text-red-400">{errors.estoque}</p>}
              </div>
            </div>

            {/* Categoria + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Categoria <span className="text-orange-500">*</span>
                </label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className={inputClass('categoria')}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value} className="bg-gray-800">{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
                <select
                  value={form.is_active ? 'true' : 'false'}
                  onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })}
                  className={inputClass('is_active')}
                >
                  <option value="true" className="bg-gray-800">✓ Ativo</option>
                  <option value="false" className="bg-gray-800">○ Inativo</option>
                </select>
              </div>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Imagens do Produto {!isEditing && <span className="text-orange-500">*</span>}
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-orange-500/50 hover:bg-orange-500/5 ${
                  imageError ? 'border-red-500/50' : 'border-gray-700'
                }`}
              >
                <div className="w-12 h-12 bg-orange-600/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FaUpload className="text-orange-500 text-xl" />
                </div>
                <p className="text-gray-300 text-sm font-medium">Clique para selecionar imagens</p>
                <p className="text-gray-600 text-xs mt-1">JPG, PNG, WEBP — múltiplos arquivos</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              {imageError && <p className="mt-1 text-xs text-red-400">{imageError}</p>}

              {/* Existing image */}
              {existingImage && selectedFiles.length === 0 && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-black/30 border border-white/10 rounded-xl">
                  <img
                    src={existingImage.startsWith('/uploads')
                      ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${existingImage}`
                      : existingImage}
                    alt="Imagem atual"
                    className="w-12 h-12 object-cover rounded-lg border border-white/10"
                  />
                  <span className="text-gray-500 text-xs">Imagem atual — selecione outra para substituir</span>
                </div>
              )}

              {/* Previews */}
              {previews.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={src}
                        alt={`Preview ${i + 1}`}
                        className="w-16 h-16 object-cover rounded-xl border border-white/10"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {serverError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {serverError}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Link
                to="/admin/dashboard"
                className="flex-1 py-3 text-center bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700 text-gray-300 font-semibold rounded-xl transition-all text-sm"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-500/30 text-sm"
              >
                {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Produto'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProductForm;
