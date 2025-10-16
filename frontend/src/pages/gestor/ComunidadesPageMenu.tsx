//@ts-nocheck
import React, { useState, createContext, useContext, forwardRef } from 'react';
import { Plus, Users, MessageCircle, TrendingUp, Settings, UserPlus, Eye, Heart, Share, X, Upload, Globe, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { useNavigate } from 'react-router-dom';
import SidebarGestor from '../gestor/components/Sidebar';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import { useAuth } from '../../hooks/useAuth';

interface Community {
  id: number;
  name: string;
  description: string;
  coverImage: string;
  members: number;
  category: string;
  posts: number;
  isOpen: boolean;
  creator: string;
  lastActivity: string;
  onlineMembers: number;
}

interface CommunityDetailModalProps {
  community: Community;
  isOpen: boolean;
  sidebarAberta: boolean;
  newPost: string;
  userJoinedCommunities: number[];
  onClose: () => void;
  onChangePost: (v: string) => void;
  onCreatePost: () => void;
  handleJoinCommunity: (id: number) => void;
  communityPosts: {
    id: number;
    author: string;
    avatar: string;
    content: string;
    timestamp: string;
    likes: number;
    comments: number;
    image: string | null;
  }[];
}

const CommunityDetailModal: React.FC<CommunityDetailModalProps> = ({
  community,
  isOpen,
  sidebarAberta,
  newPost,
  userJoinedCommunities,
  onClose,
  onChangePost,
  onCreatePost,
  handleJoinCommunity,
  communityPosts
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* 2) Backdrop atrás do drawer */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`
          absolute top-16 bottom-0
          left-0 right-0            /* mobile: ocupar 100% */
          sm:right-0                /* a partir de sm: alinhar à direita */
          ${sidebarAberta ? 'sm:left-64' : 'sm:left-20'}  /* sm+: margem de desktop */
          z-50 pointer-events-none
        `}>
        <div className="bg-white w-full h-full overflow-auto pointer-events-auto">
          {/* cabeçalho com imagem e botão fechar */}
          <div className="relative">
            <img
              src={community.coverImage}
              alt={community.name}
              className="w-full h-48 object-cover"
            />
            {/* botão X com fundo escuro e padding */}
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="absolute top-4 right-4 bg-white/60 p-2 rounded-full
            hover:bg-black/70 hover:scale-110
            transition-transform duration-200 ease-in-out
            focus:outline-none">
              <X className="h-5 w-5 text-white" />
            </button>
            <div className="absolute bottom-4 left-6">
              <h1 className="text-3xl font-bold text-white mb-2">{community.name}</h1>
              <Badge variant="secondary">{community.category}</Badge>
            </div>
          </div>

          {/* layout de duas colunas: conteúdo principal + sidebar */}
          <div className="flex flex-col sm:flex-row">
            {/* conteúdo principal */}
            <div className="flex-1 p-6">
              {/* botões de ação */}
              <div className="flex items-center gap-4 mb-6">
                <Button
                  onClick={() => handleJoinCommunity(community.id)}
                  className={cn(
                    userJoinedCommunities.includes(community.id)
                      ? 'bg-indigo-500 hover:bg-indigo-600'
                      : 'bg-indigo-500 hover:bg-indigo-600',
                    'transition-colors'
                  )}
                >
                  {userJoinedCommunities.includes(community.id) ? 'Sair' : 'Participar'}
                </Button>
                <Button variant="outline" className="hover:bg-gray-100 transition-colors">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Convidar
                </Button>
                <Button variant="outline" className="hover:bg-gray-100 transition-colors">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
              </div>

              {/* textarea e publicar */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <Textarea
                  id="newPost"
                  name="newPost"
                  placeholder="Compartilhe algo com a comunidade..."
                  value={newPost}
                  onChange={e => onChangePost(e.target.value)}
                  className="border-0 bg-transparent resize-none mb-3"
                />
                <div className="flex justify-between items-center">
                  <Button variant="ghost" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Anexar arquivo
                  </Button>
                  <Button onClick={onCreatePost} disabled={!newPost.trim()}>
                    Publicar
                  </Button>
                </div>
              </div>

              {/* feed da comunidade */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-4">Feed da Comunidade</h3>
                {communityPosts.map(post => (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.avatar} />
                          <AvatarFallback>{post.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{post.author}</span>
                            <span className="text-sm text-gray-500">{post.timestamp}</span>
                          </div>
                          <p className="text-gray-700 mb-3">{post.content}</p>
                          {post.image && (
                            <img src={post.image} className="rounded-lg mb-3 max-w-md" />
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <button className="flex items-center gap-1 hover:text-indigo-500 transition-colors">
                              <Heart className="h-4 w-4" /> {post.likes}
                            </button>
                            <button className="flex items-center gap-1 hover:text-indigo-500 transition-colors">
                              <MessageCircle className="h-4 w-4" /> {post.comments}
                            </button>
                            <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                              <Share className="h-4 w-4" /> Compartilhar
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* sidebar interna */}
            <aside className="w-full sm:w-80 border-t sm:border-l bg-gray-50 p-4 sm:p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Membros Online ({community.onlineMembers})
              </h3>
              <div className="space-y-2 mb-6">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://i.pravatar.cc/300`} />
                        <AvatarFallback>U{i}</AvatarFallback>
                      </Avatar>
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                    <span className="text-sm">Usuário {i}</span>
                  </div>
                ))}
              </div>
              <h3 className="font-semibold mb-3">Tópicos Fixados</h3>
              <div className="space-y-2">
                <div className="p-3 bg-white rounded-lg border hover:bg-gray-100 cursor-pointer transition-colors">
                  <h4 className="font-medium text-sm">Regras da Comunidade</h4>
                  <p className="text-xs text-gray-500">Leia antes de participar</p>
                </div>
                <div className="p-3 bg-white rounded-lg border hover:bg-gray-100 cursor-pointer transition-colors">
                  <h4 className="font-medium text-sm">Recursos Úteis</h4>
                  <p className="text-xs text-gray-500">Links e materiais importantes</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div></div>
  );
};

// Button Component
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// Card Components
const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
)
CardFooter.displayName = "CardFooter"

// Badge Component
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-white text-gray-800 hover:bg-gray-100",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// Dialog Components
const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger

const DialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-gradient-to-br from-green-100 to-indigo-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

// Input Component
const Input = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

// Textarea Component
const Textarea = forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

// Select Components
const Select = SelectPrimitive.Root
const SelectTrigger = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="m4.93179 5.43179 2.53842 2.53842 2.53842-2.53842c.1952-.1952.5118-.1952.7071 0 .1952.1953.1952.5119 0 .7071L7.5 9.36396c-.3905.3905-1.0237.3905-1.4142 0L2.86396 6.13867c-.19526-.1952-.19526-.5118 0-.7071.19526-.1952.51184-.1952.70710 0Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
      </svg>
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectValue = SelectPrimitive.Value
const SelectContent = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
        "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
          "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectItem = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m11.4669 3.72684c.2634.20151.3133.58136.1117.84498L6.14405 11.6157c-.20151.2634-.58136.3133-.84498.1117-.26362-.2015-.31329-.5814-.11174-.8450L10.6221 4.39157c.2015-.26362.5814-.31329.8449-.11174Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
          <path d="m4.50001 7.70711L8.09095 3.5L7.09095 2.5L3.50001 6.70711l.99999 1Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
        </svg>
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

// Avatar Components
const Avatar = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  )
)
Avatar.displayName = "Avatar"

const AvatarImage = forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, ...props }, ref) => (
    <img
      ref={ref}
      className={cn("aspect-square h-full w-full", className)}
      {...props}
    />
  )
)
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}
      {...props}
    />
  )
)
AvatarFallback.displayName = "AvatarFallback"

// Main Communities Component
const ComunidadePageMenu = () => {

  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [userJoinedCommunities, setUserJoinedCommunities] = useState([1, 3]);
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useAuth();
  const currentUser = user;
  const role = currentUser?.role ?? '';
  const showSidebar = !['responsavel', 'aluno'].includes(role);


  // Mock data para comunidades
  const [communities, setCommunities] = useState([
    {
      id: 1,
      name: "Matemática Avançada",
      description: "Discussões sobre cálculo, álgebra linear e matemática aplicada para estudantes de exatas.",
      coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
      members: 1247,
      category: "Matemática",
      posts: 156,
      isOpen: true,
      creator: "Prof. Maria Santos",
      lastActivity: "2 horas atrás",
      onlineMembers: 23
    },
    {
      id: 2,
      name: "Literatura Contemporânea",
      description: "Análise e discussão de obras literárias modernas e contemporâneas.",
      coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
      members: 892,
      category: "Literatura",
      posts: 234,
      isOpen: true,
      creator: "Prof. João Silva",
      lastActivity: "1 hora atrás",
      onlineMembers: 15
    },
    {
      id: 3,
      name: "Programação Python",
      description: "Aprenda Python do básico ao avançado com projetos práticos e exercícios.",
      coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",
      members: 2103,
      category: "Tecnologia",
      posts: 567,
      isOpen: true,
      creator: "Prof. Ana Costa",
      lastActivity: "30 min atrás",
      onlineMembers: 45
    },
    {
      id: 4,
      name: "História do Brasil",
      description: "Estudos aprofundados sobre a história brasileira e seus contextos sociais.",
      coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      members: 756,
      category: "História",
      posts: 189,
      isOpen: false,
      creator: "Prof. Carlos Lima",
      lastActivity: "3 horas atrás",
      onlineMembers: 8
    },
    {
      id: 5,
      name: "Química Orgânica",
      description: "Reações, mecanismos e síntese em química orgânica para estudantes avançados.",
      coverImage: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400",
      members: 634,
      category: "Química",
      posts: 123,
      isOpen: true,
      creator: "Prof. Lucia Ferreira",
      lastActivity: "5 horas atrás",
      onlineMembers: 12
    },
    {
      id: 6,
      name: "Física Quântica",
      description: "Explorando os mistérios da mecânica quântica e suas aplicações modernas.",
      coverImage: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400",
      members: 445,
      category: "Física",
      posts: 78,
      isOpen: true,
      creator: "Prof. Roberto Mendes",
      lastActivity: "1 dia atrás",
      onlineMembers: 6
    }
  ]);

  // Mock data para posts da comunidade
  const [communityPosts, setCommunityPosts] = useState([
    {
      id: 1,
      author: "Ana Carolina",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40",
      content: "Alguém pode me ajudar com este exercício de limites? Estou com dificuldade para resolver...",
      timestamp: "2 horas atrás",
      likes: 12,
      comments: 5,
      image: null
    },
    {
      id: 2,
      author: "Prof. Maria Santos",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40",
      content: "Nova lista de exercícios disponível! Foquem nos problemas de integração por partes.",
      timestamp: "4 horas atrás",
      likes: 28,
      comments: 8,
      image: null
    }
  ]);

  const topCommunities = communities
    .sort((a, b) => b.members - a.members)
    .slice(0, 5);

  const handleJoinCommunity = (communityId) => {
    if (userJoinedCommunities.includes(communityId)) {
      setUserJoinedCommunities(userJoinedCommunities.filter(id => id !== communityId));
    } else {
      setUserJoinedCommunities([...userJoinedCommunities, communityId]);
    }
  };

  const handleCreatePost = () => {
    if (newPost.trim()) {
      const post = {
        id: Date.now(),
        author: "Você",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40",
        content: newPost,
        timestamp: "Agora",
        likes: 0,
        comments: 0,
        image: null
      };
      setCommunityPosts([post, ...communityPosts]);
      setNewPost('');
    }
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
        <TopbarGestorAuto />

        <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-100">
          <div className="container mx-auto px-4 py-8">
            <header className="text-center mb-12">
              <h1 className="text-4xl font-bold bg-indigo-600 bg-clip-text text-transparent mb-4">
                Comunidades Educacionais
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Conecte-se, aprenda e colabore com colegas e professores em grupos temáticos
              </p>
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
              <main className="flex-1">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Explore Comunidades</h2>
                    <p className="text-gray-600">Encontre grupos que combinam com seus interesses</p>
                  </div>

                  <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-indigo-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg">
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Comunidade
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Criar Nova Comunidade</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input placeholder="Nome da comunidade" />
                        <Textarea placeholder="Descrição da comunidade" />
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Foto de Capa</label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Clique para enviar uma imagem</p>
                          </div>
                        </div>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo de comunidade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Aberta - Qualquer um pode participar
                              </div>
                            </SelectItem>
                            <SelectItem value="closed">
                              <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Fechada - Apenas por convite
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2 pt-4">
                          <Button variant="outline" className="flex-1" onClick={() => setIsCreateModalOpen(false)}>
                            Cancelar
                          </Button>
                          <Button className="flex-1 bg-indigo-500 hover:bg-indigo-600">
                            Criar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {communities.map((community) => (
                    <Card
                      key={community.id}
                      className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                      onClick={() => setSelectedCommunity(community)}
                    >
                      <div className="relative">
                        <img
                          src={community.coverImage}
                          alt={community.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <Badge
                          variant="secondary"
                          className="absolute top-3 left-3 bg-white/90 text-gray-800"
                        >
                          {community.category}
                        </Badge>
                        <div className="absolute top-3 right-3">
                          {community.isOpen ? (
                            <Globe className="h-4 w-4 text-white" />
                          ) : (
                            <Lock className="h-4 w-4 text-white" />
                          )}
                        </div>
                      </div>

                      <CardHeader className="pb-3">
                        <h3 className="font-semibold text-lg line-clamp-1">{community.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{community.description}</p>
                      </CardHeader>

                      <CardContent className="py-3">
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {community.members}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {community.posts}
                          </span>
                          <span className="text-xs">{community.lastActivity}</span>
                        </div>
                      </CardContent>

                      <CardFooter className="pt-0">
                        <div className="flex gap-2 w-full">
                          {userJoinedCommunities.includes(community.id) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinCommunity(community.id);
                              }}
                            >
                              Sair
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="flex-1 bg-indigo-500 hover:bg-indigo-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinCommunity(community.id);
                              }}
                            >
                              Participar
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCommunity(community);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </main>

              <aside className="lg:w-80">
                <Card className="sticky top-8">
                  <CardHeader>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-indigo-500" />
                      Comunidades em Alta
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topCommunities.map((community, index) => (
                      <div
                        key={community.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedCommunity(community)}
                      >
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-400 text-white text-sm font-semibold">
                            {index + 1}
                          </span>
                        </div>
                        <img
                          src={community.coverImage}
                          alt={community.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1">{community.name}</h4>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {community.members.toLocaleString()} membros
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </aside>
            </div>
          </div>

          {selectedCommunity && (
            <CommunityDetailModal
              community={selectedCommunity}
              isOpen={!!selectedCommunity}
              sidebarAberta={sidebarAberta}
              newPost={newPost}
              userJoinedCommunities={userJoinedCommunities}
              onClose={() => setSelectedCommunity(null)}
              onChangePost={setNewPost}
              onCreatePost={handleCreatePost}
              handleJoinCommunity={handleJoinCommunity}
              communityPosts={communityPosts}   // <— e aqui!
            />
          )}
        </div>
      </div></div>);
};

export default ComunidadePageMenu;