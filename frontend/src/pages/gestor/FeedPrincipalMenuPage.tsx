import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Search, Bell, Camera, Video, X, Send, Users, Book, GraduationCap } from 'lucide-react';
import SidebarGestor from '../gestor/components/Sidebar';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

interface Usuario {
  id: number;
  nome: string;
  role: 'professor' | 'aluno' | string;
  foto?: string;
  foto_url?: string;
}

// Tipos de dados
interface User {
  id: number;
  name: string;
  role: 'professor' | 'aluno' | 'comunidade';
  avatar: string;
  isFollowing: boolean;
  isOnline?: boolean;
}

interface Comment {
  id: number;
  author: User;
  content: string;
  timestamp: string;
}

interface Post {
  id: number;
  author: User;
  content: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  images?: string[];
  hasVideo?: boolean;
  isLiked: boolean;
}

const FeedPrincipalMenuPage = () => {
  // Estados
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const { user } = useAuth();
  const currentUser = user;
  const role = currentUser?.role ?? '';
  const showSidebar = !['responsavel', 'aluno'].includes(role);

  // Dados mockados
  const mockUsers: User[] = [
    { id: 1, name: 'Prof. Maria Silva', role: 'professor', avatar: 'https://i.pravatar.cc/300', isFollowing: false, isOnline: true },
    { id: 2, name: 'João Santos', role: 'aluno', avatar: 'https://i.pravatar.cc/300', isFollowing: true, isOnline: true },
    { id: 3, name: 'Turma de Física', role: 'comunidade', avatar: 'https://i.pravatar.cc/300', isFollowing: false, isOnline: false },
    { id: 4, name: 'Ana Costa', role: 'aluno', avatar: 'https://i.pravatar.cc/300', isFollowing: false, isOnline: true },
    { id: 5, name: 'Prof. Carlos Lima', role: 'professor', avatar: 'https://i.pravatar.cc/300', isFollowing: true, isOnline: false },
    { id: 6, name: 'Clube de Matemática', role: 'comunidade', avatar: 'https://i.pravatar.cc/300', isFollowing: true, isOnline: false },
  ];

  const generateMockPosts = (): Post[] => [
    {
      id: 1,
      author: mockUsers[0],
      content: 'Pessoal, nossa aula de hoje sobre Física Quântica foi incrível! Quem mais ficou fascinado com o experimento da dupla fenda? 🔬✨',
      timestamp: 'há 2h',
      likes: 24,
      comments: [
        { id: 1, author: mockUsers[1], content: 'Professora, foi mesmo muito interessante! Ainda estou tentando entender como a observação muda o resultado.', timestamp: 'há 1h' },
        { id: 2, author: mockUsers[3], content: 'Adorei a explicação! Poderia recomendar alguns livros sobre o assunto?', timestamp: 'há 45min' }
      ],
      images: ['https://s2.glbimg.com/RBlTh4vWGiFcUWEkxT50MH5_YnI=/e.glbimg.com/og/ed/f/original/2022/06/02/physics-gf72bd469e_1920.jpg'],
      isLiked: true
    },
    {
      id: 2,
      author: mockUsers[2],
      content: 'Lembrete: Nossa competição de Física acontece na próxima sexta-feira! Ainda há vagas para participar. Venham mostrar seus conhecimentos! 🏆📚',
      timestamp: 'há 4h',
      likes: 18,
      comments: [
        { id: 3, author: mockUsers[1], content: 'Já me inscrevi! Mal posso esperar!', timestamp: 'há 3h' }
      ],
      isLiked: false
    },
    {
      id: 3,
      author: mockUsers[1],
      content: 'Alguém mais está tendo dificuldades com as equações de segundo grau? Preciso de ajuda para a prova de amanhã 😅📝',
      timestamp: 'há 6h',
      likes: 12,
      comments: [
        { id: 4, author: mockUsers[4], content: 'João, passo na sua mesa depois da aula para te ajudar!', timestamp: 'há 5h' },
        { id: 5, author: mockUsers[3], content: 'Eu também estava com dúvidas, obrigada professor Carlos!', timestamp: 'há 4h' }
      ],
      isLiked: false
    },
    {
      id: 4,
      author: mockUsers[5],
      content: 'Acabamos de resolver um problema super desafiador sobre progressões geométricas! Alguém quer tentar resolver este aqui? 🤔🧮',
      timestamp: 'há 8h',
      likes: 31,
      comments: [],
      images: ['https://dhg1h5j42swfq.cloudfront.net/2020/06/17125328/image-255.png'],
      hasVideo: true,
      isLiked: true
    },
    {
      id: 5,
      author: mockUsers[4],
      content: 'Excelente apresentação dos alunos do 3º ano sobre sustentabilidade hoje! Parabéns a todos pelo empenho e criatividade 🌱👏',
      timestamp: 'há 12h',
      likes: 45,
      comments: [
        { id: 6, author: mockUsers[1], content: 'Obrigado professor! Foi muito gratificante trabalhar neste projeto.', timestamp: 'há 11h' }
      ],
      images: ['https://meiosustentavel.com.br/wp-content/uploads/2019/07/1814-1024x683.jpg'],
      isLiked: true
    }
  ];

  // Inicialização
  useEffect(() => {
    setPosts(generateMockPosts());
  }, []);

  // Funções
  const handleLike = (postId: number) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleFollow = (userId: number) => {
    // Atualizar em posts
    setPosts(posts.map(post =>
      post.author.id === userId
        ? { ...post, author: { ...post.author, isFollowing: !post.author.isFollowing } }
        : post
    ));
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    const newPostObj: Post = {
      id: Date.now(),
      author: mockUsers[1], // Usuário atual simulado
      content: newPost,
      timestamp: 'agora',
      likes: 0,
      comments: [],
      isLiked: false
    };

    setPosts([newPostObj, ...posts]);
    setNewPost('');
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedPost) return;

    const comment: Comment = {
      id: Date.now(),
      author: mockUsers[1], // Usuário atual simulado
      content: newComment,
      timestamp: 'agora'
    };

    const updatedPost = {
      ...selectedPost,
      comments: [...selectedPost.comments, comment]
    };

    setPosts(posts.map(post =>
      post.id === selectedPost.id ? updatedPost : post
    ));

    setSelectedPost(updatedPost);
    setNewComment('');
  };

  const loadMorePosts = () => {
    setLoading(true);
    // Simular carregamento
    setTimeout(() => {
      const morePosts = generateMockPosts().map(post => ({
        ...post,
        id: post.id + posts.length * 10
      }));
      setPosts([...posts, ...morePosts]);
      setLoading(false);
    }, 1000);
  };

  // Scroll infinito
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        if (!loading) {
          loadMorePosts();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [posts.length, loading]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'professor': return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'aluno': return <Book className="w-4 h-4 text-green-600" />;
      case 'comunidade': return <Users className="w-4 h-4 text-purple-600" />;
      default: return null;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'professor': return 'bg-blue-100 text-blue-800';
      case 'aluno': return 'bg-green-100 text-green-800';
      case 'comunidade': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    const buscarUsuarios = async () => {
      try {
        const { data: todosUsuarios } = await axios.get<Usuario[]>('/api/usuarios');
        const filtrados = todosUsuarios.filter(
          u => (u.role === 'professor' || u.role === 'aluno')
            && String(u.id) !== selectedUserId
        );
        setUsuarios(filtrados);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
      }
    };
    buscarUsuarios();
  }, [selectedUserId]);

  return (

    <div className="min-h-screen bg-gray-100 flex overflow-x-hidden">
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

      <div className={`flex-1 flex flex-col pt-16 duration-300 ${sidebarAberta ? 'sm:ml-64' : 'sm:ml-20'} ml-0 bg-gray-100`}>
        <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />

        <div className="min-h-screen bg-indigo-200">
          {/* Header */}
          <header className="bg-white shadow-lg border-b-4 border-indigo-200 sticky top-0 z-40">
            <div className="max-w-6xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">

                {/* Search */}
                <div className="flex-1 flex justify-center">
                  <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar amigos, comunidades..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-6xl mx-auto px-2 sm:px-4 py-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">


              {/* Sidebar - Amigos Online */}
              <div className="lg:col-span-1 lg:order-last min-w-0">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Amigos Online
                  </h3>
                  <div className="space-y-3">
                    {mockUsers.filter(user => user.isOnline).map(user => (
                      <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="relative">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(user.role)}`}>
                            {getRoleIcon(user.role)}
                            <span className="ml-1 capitalize">{user.role}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Feed */}
              <div className="lg:col-span-3 min-w-0">
                {/* Create Post */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face"
                      alt="Meu avatar"
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <textarea
                        placeholder="Compartilhe uma notícia, dúvida ou evento..."
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="w-full max-w-full p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        maxLength={300}
                      />
                      <div className="flex flex-wrap items-center justify-between mt-4 min-w-0">
                        <div className="flex space-x-2 sm:space-x-4">
                          <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                            <Camera className="w-5 h-5" />
                            <span>Foto</span>
                          </button>
                          <button className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors">
                            <Video className="w-5 h-5" />
                            <span>Vídeo</span>
                          </button>
                        </div>
                        <div className="flex items-center space-x-3 flex-shrink-0">
                          <span className="text-sm text-gray-500 whitespace-nowrap">{newPost.length}/300</span>
                          <button
                            onClick={handleCreatePost}
                            disabled={!newPost.trim()}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 sm:px-6 rounded-full font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                          >
                            Publicar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Posts Feed */}
                <div className="space-y-6">
                  {posts.map(post => (
                    <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      {/* Post Header */}
                      <div className="p-6 pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img
                              src={post.author.avatar}
                              alt={post.author.name}
                              className="w-12 h-12 rounded-full cursor-pointer hover:ring-4 hover:ring-blue-200 transition-all"
                            />
                            <div>
                              <h4 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">
                                {post.author.name}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(post.author.role)}`}>
                                  {getRoleIcon(post.author.role)}
                                  <span className="ml-1 capitalize">{post.author.role}</span>
                                </div>
                                <span className="text-sm text-gray-500">• {post.timestamp}</span>
                              </div>
                            </div>
                          </div>

                          {!post.author.isFollowing && post.author.id !== 2 && (
                            <button
                              onClick={() => handleFollow(post.author.id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              Seguir
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="px-6">
                        <p className="text-gray-800 leading-relaxed mb-4">{post.content}</p>

                        {/* Media */}
                        {post.images && (
                          <div className="mb-4">
                            <img
                              src={post.images[0]}
                              alt="Post content"
                              className="w-full max-w-full h-auto object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                            />

                          </div>
                        )}
                      </div>

                      {/* Post Actions */}
                      <div className="px-6 py-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-6">
                            <button
                              onClick={() => handleLike(post.id)}
                              className={`flex items-center space-x-2 transition-colors ${post.isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                                }`}
                            >
                              <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                              <span className="font-medium">{post.likes}</span>
                            </button>

                            <button
                              onClick={() => setSelectedPost(post)}
                              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              <MessageCircle className="w-5 h-5" />
                              <span className="font-medium">{post.comments.length}</span>
                            </button>

                            <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                              <Share2 className="w-5 h-5" />
                              <span className="font-medium">Compartilhar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Loading Indicator */}
                {loading && (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments Modal */}
          {selectedPost && (
            <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-indigo-100 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Comentários</h3>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Post Content in Modal */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={selectedPost.author.avatar}
                      alt={selectedPost.author.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{selectedPost.author.name}</h4>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(selectedPost.author.role)}`}>
                        {getRoleIcon(selectedPost.author.role)}
                        <span className="ml-1 capitalize">{selectedPost.author.role}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-800">{selectedPost.content}</p>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto max-h-60 p-6">
                  {selectedPost.comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Seja o primeiro a comentar!</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedPost.comments.map(comment => (
                        <div key={comment.id} className="flex items-start space-x-3">
                          <img
                            src={comment.author.avatar}
                            alt={comment.author.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1 bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm text-gray-900">{comment.author.name}</span>
                              <div className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs ${getRoleBadgeColor(comment.author.role)}`}>
                                {getRoleIcon(comment.author.role)}
                              </div>
                              <span className="text-xs text-gray-500">{comment.timestamp}</span>
                            </div>
                            <p className="text-gray-800 text-sm">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Comment */}
                <div className="p-6 border-t border-gray-200">
                  <div className="flex items-start space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                      alt="Meu avatar"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <textarea
                        placeholder="Escreva um comentário..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full max-w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          <span>Enviar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div></div>);
};

export default FeedPrincipalMenuPage;