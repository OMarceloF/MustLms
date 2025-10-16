import React, { useState } from 'react';
import { Heart, MessageCircle, Plus, Calendar, User, Bookmark, Send, X } from 'lucide-react';
import InteractiveCards from '../gestor/components/InteractiveCards';
import SidebarGestor from './components/Sidebar';
import { useNavigate } from 'react-router-dom';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import { useAuth } from '../../hooks/useAuth';

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
}

interface News {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  date: string;
  image?: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
}

const NoticiasPageMenu = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const navigate = useNavigate();
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const { user } = useAuth();
  const currentUser = user;
  const role = currentUser?.role ?? '';
  const showSidebar = !['responsavel', 'aluno'].includes(role);


  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    image: ''
  });

  const [news, setNews] = useState<News[]>([
    {
      id: '1',
      title: 'Feira de Ciências 2024 - Projetos Inovadores',
      description: 'Nossa escola se orgulha em apresentar os projetos mais criativos desenvolvidos pelos alunos durante o semestre. Os trabalhos abordam temas como sustentabilidade, tecnologia e saúde.',
      category: 'Atividades',
      author: 'Prof. Maria Silva',
      date: '2024-06-20',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop',
      likes: 24,
      liked: false,
      comments: [
        {
          id: '1',
          author: 'João Santos',
          content: 'Parabéns pela iniciativa! Os projetos estão incríveis.',
          date: '2024-06-20'
        }
      ]
    },
    {
      id: '2',
      title: 'Novo Sistema de Avaliação Online',
      description: 'Implementamos uma nova plataforma de avaliação que permitirá maior flexibilidade e acompanhamento em tempo real do desempenho dos estudantes.',
      category: 'Comunicados',
      author: 'Diretor Carlos Mendes',
      date: '2024-06-18',
      likes: 18,
      liked: true,
      comments: []
    },
    {
      id: '3',
      title: 'Olimpíada de Matemática - Inscrições Abertas',
      description: 'As inscrições para a Olimpíada Interna de Matemática estão abertas até o dia 30 de junho. Venha participar e mostrar seus conhecimentos!',
      category: 'Atividades',
      author: 'Prof. Ana Costa',
      date: '2024-06-15',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop',
      likes: 31,
      liked: false,
      comments: [
        {
          id: '1',
          author: 'Pedro Lima',
          content: 'Já fiz minha inscrição! Muito animado para participar.',
          date: '2024-06-16'
        },
        {
          id: '2',
          author: 'Marina Oliveira',
          content: 'Ótima iniciativa para estimular o aprendizado!',
          date: '2024-06-17'
        }
      ]
    }
  ]);

  const handleCreateNews = () => {
    if (formData.title && formData.description && formData.category && formData.date) {
      const newNews: News = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        category: formData.category,
        author: 'Usuário Atual',
        date: formData.date,
        image: formData.image,
        likes: 0,
        liked: false,
        comments: []
      };

      setNews([newNews, ...news]);
      setFormData({ title: '', description: '', category: '', date: '', image: '' });
      setShowCreateForm(false);
    }
  };

  const handleLike = (id: string) => {
    setNews(news.map(item =>
      item.id === id
        ? { ...item, liked: !item.liked, likes: item.liked ? item.likes - 1 : item.likes + 1 }
        : item
    ));
  };

  const handleAddComment = (newsId: string) => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: 'Usuário Atual',
        content: newComment,
        date: new Date().toISOString().split('T')[0]
      };

      setNews(news.map(item =>
        item.id === newsId
          ? { ...item, comments: [...item.comments, comment] }
          : item
      ));
      setNewComment('');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      
      'Comunicados': 'bg-green-100 text-green-800',
      'Atividades': 'bg-purple-100 text-purple-800',
      'Conquistas': 'bg-yellow-100 text-yellow-800',
      'Campanhas': 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {showSidebar && (
        <SidebarGestor
          isMenuOpen={sidebarAberta}
          setActivePage={(page: string) =>
            navigate('/gestor', { state: { activePage: page } })
          }
          handleMouseEnter={() => setSidebarAberta(true)}
          handleMouseLeave={() => setSidebarAberta(false)}
        />
      )}

      <div className={`flex-1 flex flex-col pt-16 transition-all duration-300 ${sidebarAberta ? 'ml-64' : 'ml-20'}bg-gray-100`}>

        <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />

        <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-100">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Central de Notícias</h1>
                  <p className="text-gray-600 mt-1">Fique por dentro das novidades da nossa escola</p>
                </div>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <Plus size={20} />
                  Nova Publicação
                </button>
              </div>
            </div>
          </header>

          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Create Form Modal */}
            {showCreateForm && (
              <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">Criar Nova Notícia</h2>
                      <button
                        onClick={() => setShowCreateForm(false)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                          placeholder="Digite o título da notícia"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Descrição *</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                          placeholder="Descreva o conteúdo da notícia"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                          >
                            <option value="">Selecione uma categoria</option>
                            
                            <option value="Comunicados">Comunicados</option>
                            <option value="Atividades">Atividades</option>
                            <option value="Conquistas">Conquistas</option>
                            <option value="Campanhas">Campanhas</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Data *</label>
                          <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">URL da Imagem (opcional)</label>
                        <input
                          type="url"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                          placeholder="https://exemplo.com/imagem.jpg"
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleCreateNews}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors"
                        >
                          Publicar Notícia
                        </button>
                        <button
                          onClick={() => setShowCreateForm(false)}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* News Feed */}
            <div className="space-y-6">
              {news.map((item) => (
                <article key={item.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                  {/* Image */}
                  {item.image && (
                    <div className="h-64 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                          <div className="flex items-center text-gray-500 text-sm">
                            <Calendar size={16} className="mr-1" />
                            {formatDate(item.date)}
                          </div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2 hover:text-indigo-600 transition-colors cursor-pointer">
                          {item.title}
                        </h2>
                      </div>
                      <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                        <Bookmark size={20} />
                      </button>
                    </div>

                    <p className="text-gray-600 mb-4 leading-relaxed">{item.description}</p>

                    {/* Author */}
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center mr-3">
                        <User size={16} className="text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{item.author}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleLike(item.id)}
                          className={`flex items-center gap-2 transition-colors ${item.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                            }`}
                        >
                          <Heart size={20} fill={item.liked ? 'currentColor' : 'none'} />
                          <span className="font-medium">{item.likes}</span>
                        </button>

                        <button
                          onClick={() => setShowComments(showComments === item.id ? null : item.id)}
                          className="flex items-center gap-2 text-gray-500 hover:text-indigo-500 transition-colors"
                        >
                          <MessageCircle size={20} />
                          <span className="font-medium">{item.comments.length}</span>
                        </button>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {showComments === item.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {/* Comment Input */}
                        <div className="flex gap-3 mb-4">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <User size={16} className="text-gray-600" />
                          </div>
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Escreva um comentário..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                              onKeyPress={(e) => e.key === 'Enter' && handleAddComment(item.id)}
                            />
                            <button
                              onClick={() => handleAddComment(item.id)}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              <Send size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-3">
                          {item.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <User size={16} className="text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm text-gray-800">{comment.author}</span>
                                    <span className="text-xs text-gray-500">{formatDate(comment.date)}</span>
                                  </div>
                                  <p className="text-gray-700 text-sm">{comment.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div></div></div>
  );
};

export default NoticiasPageMenu;