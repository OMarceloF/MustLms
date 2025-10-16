// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { Clock, FileText, CheckCircle2, Play, Send } from 'lucide-react';

// // UI Components created inline
// const Button = React.forwardRef<
//   HTMLButtonElement,
//   React.ButtonHTMLAttributes<HTMLButtonElement> & {
//     variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
//     size?: 'default' | 'sm' | 'lg' | 'icon';
//   }
// >(({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
//   const baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
//   const variantClasses = {
//     default: "bg-primary text-primary-foreground hover:bg-primary/90",
//     destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
//     outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
//     secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
//     ghost: "hover:bg-accent hover:text-accent-foreground",
//     link: "text-primary underline-offset-4 hover:underline",
//   };
  
//   const sizeClasses = {
//     default: "h-10 px-4 py-2",
//     sm: "h-9 rounded-md px-3",
//     lg: "h-11 rounded-md px-8",
//     icon: "h-10 w-10",
//   };

//   const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

//   return (
//     <button className={classes} ref={ref} {...props} />
//   );
// });

// const Badge = React.forwardRef<
//   HTMLDivElement,
//   React.HTMLAttributes<HTMLDivElement> & {
//     variant?: 'default' | 'secondary' | 'destructive' | 'outline';
//   }
// >(({ className = '', variant = 'default', ...props }, ref) => {
//   const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
//   const variantClasses = {
//     default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
//     secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
//     destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
//     outline: "text-foreground",
//   };

//   const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

//   return (
//     <div className={classes} ref={ref} {...props} />
//   );
// });

// const Card = React.forwardRef<
//   HTMLDivElement,
//   React.HTMLAttributes<HTMLDivElement>
// >(({ className = '', ...props }, ref) => (
//   <div
//     ref={ref}
//     className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
//     {...props}
//   />
// ));

// const CardHeader = React.forwardRef<
//   HTMLDivElement,
//   React.HTMLAttributes<HTMLDivElement>
// >(({ className = '', ...props }, ref) => (
//   <div
//     ref={ref}
//     className={`flex flex-col space-y-1.5 p-6 ${className}`}
//     {...props}
//   />
// ));

// const CardContent = React.forwardRef<
//   HTMLDivElement,
//   React.HTMLAttributes<HTMLDivElement>
// >(({ className = '', ...props }, ref) => (
//   <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
// ));

// const Separator = React.forwardRef<
//   HTMLDivElement,
//   React.HTMLAttributes<HTMLDivElement> & {
//     orientation?: 'horizontal' | 'vertical';
//     decorative?: boolean;
//   }
// >(({ className = '', orientation = 'horizontal', decorative = true, ...props }, ref) => {
//   const classes = `shrink-0 bg-border ${
//     orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'
//   } ${className}`;

//   return (
//     <div
//       ref={ref}
//       className={classes}
//       {...props}
//     />
//   );
// });

// interface BaseProfile {
//   id: string;
//   email: string;
//   biography: string;
//   unidade: string;
//   localizacao: string;
//   status?: 'online' | 'busy' | 'available';
// }

// interface Questao {
//   id: string;
//   tipo: 'multipla_escolha' | 'verdadeiro_falso' | 'aberta' | 'numerica';
//   enunciado: string;
//   valor_questao: number;
//   explicacao: string;
//   alt_1?: string;
//   alt_2?: string;
//   alt_3?: string;
//   alt_4?: string;
//   alt_certa?: number;
//   resp_modelo?: string;
//   resp_numerica?: number;
// }

// const ExercicioOnlinePage = () => {
//   const { id, envioId } = useParams<{ id: string; envioId: string }>();
//   const [selectedUserId, setSelectedUserId] = useState<string | undefined>(id);
//   const [questoes, setQuestoes] = useState<Questao[]>([]);
//   const [tempoLimite, setTempoLimite] = useState<number>(0);
//   const [tempoRestante, setTempoRestante] = useState<number>(0);
//   const [iniciado, setIniciado] = useState(false);
//   const [respostas, setRespostas] = useState<Record<string, string>>({});
//   const [tentativasPermitidas, setTentativasPermitidas] = useState<number>(0);
//   const [tentativaAtual, setTentativaAtual] = useState<number>(1);

//   const navigate = useNavigate();

//   // const handleChange = (questaoId: string, valor: string) => {
//   //   setRespostas((prev) => ({ ...prev, [questaoId]: valor }));
//   // };

//   const handleChange = (questaoId: string, valor: string) => {
//     setRespostas((prev) => ({
//       ...prev,
//       [questaoId]: valor,  // Aqui, atualizamos corretamente a resposta para cada questão
//     }));
//   };



//   const handleSubmit = async () => {
//     if (!selectedUserId || !envioId) return;

//     try {
//       const res = await axios.post(
//         `/api/exercicios/${envioId}/aluno/${selectedUserId}/salvar-respostas`,
//         { respostas }
//       );
//       alert('Respostas salvas com sucesso!');
//       navigate(-1);
//     } catch (error) {
//       console.error('Erro ao salvar respostas:', error);
//       alert('Erro ao salvar respostas.');
//     }
//   };

//   useEffect(() => {
//     const fetchExercicioEQuestoes = async () => {
//       if (!selectedUserId || !envioId) return;

//       try {
//         const responseQuestoes = await axios.get(
//           `/api/exercicios/envios/${envioId}/questoes`
//         );
//         setQuestoes(responseQuestoes.data);

//         const responseExercicio = await axios.get(
//           `/api/exercicios/envio/${envioId}/detalhes`
//         );
//         setTempoLimite(responseExercicio.data.tempoLimite);
//         setTempoRestante(responseExercicio.data.tempoLimite * 60);
//         setTentativasPermitidas(responseExercicio.data.tentativasPermitidas);

//         const responseTentativas = await axios.get(
//           `/api/exercicios/${envioId}/aluno/${selectedUserId}/tentativas`
//         );
//         setTentativaAtual(responseTentativas.data.tentativaAtual);
//       } catch (error) {
//         console.error('Erro ao buscar dados do exercício:', error);
//       }
//     };

//     fetchExercicioEQuestoes();
//   }, [selectedUserId, envioId]);

//   useEffect(() => {
//     if (id) {
//       setSelectedUserId(id);
//     }
//   }, [id]);

//   const getQuestionTypeIcon = (tipo: string) => {
//     switch (tipo) {
//       case 'multipla_escolha':
//         return '📋';
//       case 'verdadeiro_falso':
//         return '✓✗';
//       case 'aberta':
//         return '📝';
//       case 'numerica':
//         return '🔢';
//       default:
//         return '❓';
//     }
//   };

//   const getQuestionTypeLabel = (tipo: string) => {
//     switch (tipo) {
//       case 'multipla_escolha':
//         return 'Múltipla Escolha';
//       case 'verdadeiro_falso':
//         return 'Verdadeiro ou Falso';
//       case 'aberta':
//         return 'Questão Aberta';
//       case 'numerica':
//         return 'Resposta Numérica';
//       default:
//         return tipo.replace('_', ' ');
//     }
//   };

//   const getQuestionTypeColor = (tipo: string) => {
//     switch (tipo) {
//       case 'multipla_escolha':
//         return 'bg-blue-100 text-blue-800 border-blue-200';
//       case 'verdadeiro_falso':
//         return 'bg-green-100 text-green-800 border-green-200';
//       case 'aberta':
//         return 'bg-purple-100 text-purple-800 border-purple-200';
//       case 'numerica':
//         return 'bg-orange-100 text-orange-800 border-orange-200';
//       default:
//         return 'bg-gray-100 text-gray-800 border-gray-200';
//     }
//   };

//   if (!iniciado) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
//         <Card className="max-w-2xl w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
//           <CardHeader className="text-center pb-2">
//             <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
//               <Play className="w-8 h-8 text-white" />
//             </div>
//             <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//               Exercício Online
//             </h1>
//             <p className="text-gray-600 mt-2">Prepare-se para começar sua avaliação</p>
//           </CardHeader>
          
//           <CardContent className="space-y-6">
//             <div className="grid md:grid-cols-2 gap-4">
//               <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//                 <div className="flex items-center gap-2 mb-2">
//                   <FileText className="w-5 h-5 text-blue-600" />
//                   <span className="font-semibold text-blue-800">Tentativas</span>
//                 </div>
//                 <p className="text-sm text-blue-700">
//                   <strong>{tentativasPermitidas}</strong> tentativas permitidas
//                 </p>
//                 <p className="text-sm text-blue-600">
//                   Você está na <strong>{tentativaAtual}ª tentativa</strong>
//                 </p>
//               </div>
              
//               <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
//                 <div className="flex items-center gap-2 mb-2">
//                   <Clock className="w-5 h-5 text-amber-600" />
//                   <span className="font-semibold text-amber-800">Informações</span>
//                 </div>
//                 <p className="text-sm text-amber-700">
//                   Leia com atenção cada questão antes de responder
//                 </p>
//               </div>
//             </div>

//             <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
//               <div className="flex items-center gap-2 mb-3">
//                 <CheckCircle2 className="w-6 h-6 text-green-600" />
//                 <span className="font-semibold text-green-800 text-lg">Instruções Importantes</span>
//               </div>
//               <ul className="space-y-2 text-sm text-green-700">
//                 <li className="flex items-start gap-2">
//                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
//                   <span>Certifique-se de ter uma conexão estável com a internet</span>
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
//                   <span>Suas respostas serão salvas automaticamente</span>
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
//                   <span>Revise suas respostas antes de enviar</span>
//                 </li>
//               </ul>
//             </div>

//             <Button
//               className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
//               onClick={() => setIniciado(true)}
//             >
//               <Play className="w-5 h-5 mr-2" />
//               Iniciar Exercício
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 px-4">
//       <div className="max-w-4xl mx-auto">
//         <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm mb-6">
//           <CardHeader>
//             <div className="flex justify-between items-center">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
//                   <FileText className="w-6 h-6 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-800">Exercício Online</h2>
//                   <p className="text-gray-600">Responda todas as questões com atenção</p>
//                 </div>
//               </div>
//             </div>
//           </CardHeader>
//         </Card>

//         <form
//           onSubmit={(e) => {
//             e.preventDefault();
//             handleSubmit();
//           }}
//           className="space-y-6"
//         >
//           {questoes.map((q, index) => (
//             <Card key={q.id} className="shadow-lg border-0 bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
//               <CardHeader className="pb-4">
//                 <div className="flex items-start justify-between gap-4">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-3 mb-3">
//                       <span className="text-2xl">{getQuestionTypeIcon(q.tipo)}</span>
//                       <Badge className={`px-3 py-1 text-xs font-medium border ${getQuestionTypeColor(q.tipo)}`}>
//                         {getQuestionTypeLabel(q.tipo)}
//                       </Badge>
//                       <div className="flex items-center gap-1 text-sm text-gray-500">
//                         <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
//                           {index + 1}
//                         </span>
//                       </div>
//                     </div>
//                     <h3 className="text-lg font-semibold text-gray-800 leading-relaxed mb-2">
//                       {q.enunciado}
//                     </h3>
//                     {q.explicacao && (
//                       <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
//                         💡 {q.explicacao}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </CardHeader>

//               <CardContent className="pt-0">
//                 <Separator className="mb-4" />
                
//                 {/* {q.tipo === 'multipla_escolha' && (
//                   <div className="space-y-3">
//                     {[q.alt_1, q.alt_2, q.alt_3, q.alt_4].map(
//                       (alt, i) =>
//                         alt && (
//                           <label key={i} className="flex items-start gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200 group">
//                             <input
//                               type="radio"
//                               name={q.id}
//                               value={alt}
//                               onChange={() => handleChange(q.id, alt)}
//                               checked={respostas[q.id] === alt}
//                               className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
//                             />
//                             <div className="flex items-center gap-2">
//                               <span className="w-6 h-6 bg-gray-100 group-hover:bg-blue-200 text-gray-600 group-hover:text-blue-700 rounded-full flex items-center justify-center text-xs font-bold transition-colors">
//                                 {String.fromCharCode(65 + i)}
//                               </span>
//                               <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{alt}</span>
//                             </div>
//                           </label>
//                         )
//                     )}
//                   </div>
//                 )} */}

//                 {q.tipo === 'multipla_escolha' && (
//                   <div className="space-y-3">
//                     {[q.alt_1, q.alt_2, q.alt_3, q.alt_4].map((alt, i) =>
//                       alt && (
//                         <label key={i} className="flex items-start gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200 group">
//                           <input
//                             type="radio"
//                             name={q.id}  // Nome único para cada questão, evita colisões entre questões
//                             value={alt}
//                             onChange={() => handleChange(q.id, alt)} // Atualiza o estado corretamente
//                             checked={respostas[q.id] === alt} // Garantir que a alternativa correta seja marcada
//                             className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
//                           />
//                           <div className="flex items-center gap-2">
//                             <span className="w-6 h-6 bg-gray-100 group-hover:bg-blue-200 text-gray-600 group-hover:text-blue-700 rounded-full flex items-center justify-center text-xs font-bold transition-colors">
//                               {String.fromCharCode(65 + i)}  {/* Exibe a letra A, B, C, D */}
//                             </span>
//                             <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{alt}</span>
//                           </div>
//                         </label>
//                       )
//                     )}
//                   </div>
//                 )}

//                 {q.tipo === 'verdadeiro_falso' && (
//                   <div className="space-y-3">
//                     {['Verdadeiro', 'Falso'].map((val, i) => (
//                       <label key={val} className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all duration-200 group">
//                         <input
//                           type="radio"
//                           name={q.id}
//                           value={val}
//                           onChange={() => handleChange(q.id, val)}
//                           checked={respostas[q.id] === val}
//                           className="w-4 h-4 text-green-600 focus:ring-green-500"
//                         />
//                         <div className="flex items-center gap-2">
//                           <span className={`text-xl ${val === 'Verdadeiro' ? 'text-green-600' : 'text-red-600'}`}>
//                             {val === 'Verdadeiro' ? '✓' : '✗'}
//                           </span>
//                           <span className="text-gray-700 group-hover:text-gray-900 font-medium transition-colors">{val}</span>
//                         </div>
//                       </label>
//                     ))}
//                   </div>
//                 )}

//                 {q.tipo === 'aberta' && (
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium text-gray-700">Sua resposta:</label>
//                     <textarea
//                       className="w-full min-h-[120px] p-4 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:ring-purple-400 focus:ring-2 focus:ring-opacity-20 transition-all duration-200 resize-none bg-white"
//                       placeholder="Digite sua resposta detalhada aqui..."
//                       value={respostas[q.id] || ''}
//                       onChange={(e) => handleChange(q.id, e.target.value)}
//                     />
//                     <p className="text-xs text-gray-500">Seja claro e objetivo em sua resposta</p>
//                   </div>
//                 )}

//                 {q.tipo === 'numerica' && (
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium text-gray-700">Resposta numérica:</label>
//                     <input
//                       type="number"
//                       step="0.01"
//                       className="w-full p-4 text-lg border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:ring-orange-400 focus:ring-2 focus:ring-opacity-20 transition-all duration-200 bg-white"
//                       placeholder="Digite o número da resposta"
//                       value={respostas[q.id] || ''}
//                       onChange={(e) => handleChange(q.id, e.target.value)}
//                     />
//                     <p className="text-xs text-gray-500">Use ponto (.) como separador decimal se necessário</p>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           ))}

//           <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-emerald-50">
//             <CardContent className="py-6">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <CheckCircle2 className="w-8 h-8 text-green-600" />
//                   <div>
//                     <p className="font-semibold text-green-800">Pronto para enviar?</p>
//                     <p className="text-sm text-green-600">Revise suas respostas antes de finalizar</p>
//                   </div>
//                 </div>
//                 <Button 
//                   type="submit" 
//                   size="lg"
//                   className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
//                 >
//                   <Send className="w-5 h-5 mr-2" />
//                   Enviar Respostas
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ExercicioOnlinePage;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, FileText, CheckCircle2, Play, Send } from 'lucide-react';
import { toast } from 'sonner';

// UI Components created inline
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
  }
>(({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };
  
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={classes} ref={ref} {...props} />
  );
});

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }
>(({ className = '', variant = 'default', ...props }, ref) => {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variantClasses = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <div className={classes} ref={ref} {...props} />
  );
});

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
    {...props}
  />
));

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 ${className}`}
    {...props}
  />
));

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
));

const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: 'horizontal' | 'vertical';
    decorative?: boolean;
  }
>(({ className = '', orientation = 'horizontal', decorative = true, ...props }, ref) => {
  const classes = `shrink-0 bg-border ${
    orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'
  } ${className}`;

  return (
    <div
      ref={ref}
      className={classes}
      {...props}
    />
  );
});

interface BaseProfile {
  id: string;
  email: string;
  biography: string;
  unidade: string;
  localizacao: string;
  status?: 'online' | 'busy' | 'available';
}

interface Questao {
  id: string;
  tipo: 'multipla_escolha' | 'verdadeiro_falso' | 'aberta' | 'numerica';
  enunciado: string;
  valor_questao: number;
  explicacao: string;
  alt_1?: string;
  alt_2?: string;
  alt_3?: string;
  alt_4?: string;
  alt_certa?: number;
  resp_modelo?: string;
  resp_numerica?: number;
}

const ExercicioOnlinePage = () => {
  const { id, envioId } = useParams<{ id: string; envioId: string }>();
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(id);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [tempoLimite, setTempoLimite] = useState<number>(0);
  const [tempoRestante, setTempoRestante] = useState<number>(0);
  const [iniciado, setIniciado] = useState(false);
  // CORREÇÃO: Agora armazenamos o número da alternativa (1-4) em vez do texto
  const [respostas, setRespostas] = useState<Record<string, number | string>>({});
  const [tentativasPermitidas, setTentativasPermitidas] = useState<number>(0);
  const [tentativaAtual, setTentativaAtual] = useState<number>(1);

  const navigate = useNavigate();

  // CORREÇÃO: Função handleChange atualizada para trabalhar com números das alternativas
  const handleChange = (questaoId: string, valor: number | string) => {
    setRespostas((prev) => ({
      ...prev,
      [questaoId]: valor,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedUserId || !envioId) return;

    try {
      const res = await axios.post(
        `/api/exercicios/${envioId}/aluno/${selectedUserId}/salvar-respostas`,
        { respostas }
      );
      toast.success('Respostas salvas com sucesso!');
      navigate(-1);
    } catch (error) {
      console.error('Erro ao salvar respostas:', error);
      toast.error('Erro ao salvar respostas.');
    }
  };

  useEffect(() => {
    const fetchExercicioEQuestoes = async () => {
      if (!selectedUserId || !envioId) return;

      try {
        const responseQuestoes = await axios.get(
          `/api/exercicios/envios/${envioId}/questoes`
        );
        setQuestoes(responseQuestoes.data);

        const responseExercicio = await axios.get(
          `/api/exercicios/envio/${envioId}/detalhes`
        );
        setTempoLimite(responseExercicio.data.tempoLimite);
        setTempoRestante(responseExercicio.data.tempoLimite * 60);
        setTentativasPermitidas(responseExercicio.data.tentativasPermitidas);

        const responseTentativas = await axios.get(
          `/api/exercicios/${envioId}/aluno/${selectedUserId}/tentativas`
        );
        setTentativaAtual(responseTentativas.data.tentativaAtual);
      } catch (error) {
        console.error('Erro ao buscar dados do exercício:', error);
      }
    };

    fetchExercicioEQuestoes();
  }, [selectedUserId, envioId]);

  useEffect(() => {
    if (id) {
      setSelectedUserId(id);
    }
  }, [id]);

  const getQuestionTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'multipla_escolha':
        return '📋';
      case 'verdadeiro_falso':
        return '✓✗';
      case 'aberta':
        return '📝';
      case 'numerica':
        return '🔢';
      default:
        return '❓';
    }
  };

  const getQuestionTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'multipla_escolha':
        return 'Múltipla Escolha';
      case 'verdadeiro_falso':
        return 'Verdadeiro ou Falso';
      case 'aberta':
        return 'Questão Aberta';
      case 'numerica':
        return 'Resposta Numérica';
      default:
        return tipo.replace('_', ' ');
    }
  };

  const getQuestionTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'multipla_escolha':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'verdadeiro_falso':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'aberta':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'numerica':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!iniciado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Play className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Exercício Online
            </h1>
            <p className="text-gray-600 mt-2">Prepare-se para começar sua avaliação</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Tentativas</span>
                </div>
                <p className="text-sm text-blue-700">
                  <strong>{tentativasPermitidas}</strong> tentativas permitidas
                </p>
                <p className="text-sm text-blue-600">
                  Você está na <strong>{tentativaAtual}ª tentativa</strong>
                </p>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold text-amber-800">Informações</span>
                </div>
                <p className="text-sm text-amber-700">
                  Leia com atenção cada questão antes de responder
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <span className="font-semibold text-green-800 text-lg">Instruções Importantes</span>
              </div>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Certifique-se de ter uma conexão estável com a internet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Suas respostas serão salvas automaticamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Revise suas respostas antes de enviar</span>
                </li>
              </ul>
            </div>

            <Button
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={() => setIniciado(true)}
            >
              <Play className="w-5 h-5 mr-2" />
              Iniciar Exercício
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Exercício Online</h2>
                  <p className="text-gray-600">Responda todas as questões com atenção</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6"
        >
          {questoes.map((q, index) => (
            <Card key={q.id} className="shadow-lg border-0 bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{getQuestionTypeIcon(q.tipo)}</span>
                      <Badge className={`px-3 py-1 text-xs font-medium border ${getQuestionTypeColor(q.tipo)}`}>
                        {getQuestionTypeLabel(q.tipo)}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 leading-relaxed mb-2">
                      {q.enunciado}
                    </h3>
                    {q.explicacao && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                        💡 {q.explicacao}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <Separator className="mb-4" />
                
                {/* CORREÇÃO: Questões de múltipla escolha agora usam o índice da alternativa (1-4) */}
                {q.tipo === 'multipla_escolha' && (
                  <div className="space-y-3">
                    {[q.alt_1, q.alt_2, q.alt_3, q.alt_4].map((alt, i) =>
                      alt && (
                        <label key={i} className="flex items-start gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200 group">
                          <input
                            type="radio"
                            name={q.id}  // Nome único para cada questão
                            value={i + 1}  // CORREÇÃO: Usar o índice da alternativa (1-4)
                            onChange={() => handleChange(q.id, i + 1)} // CORREÇÃO: Passar o índice da alternativa
                            checked={respostas[q.id] === (i + 1)} // CORREÇÃO: Comparar com o índice armazenado
                            className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-gray-100 group-hover:bg-blue-200 text-gray-600 group-hover:text-blue-700 rounded-full flex items-center justify-center text-xs font-bold transition-colors">
                              {String.fromCharCode(65 + i)}  {/* Exibe a letra A, B, C, D */}
                            </span>
                            <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{alt}</span>
                          </div>
                        </label>
                      )
                    )}
                  </div>
                )}

                {/* CORREÇÃO: Questões verdadeiro/falso também usam números (1 para Verdadeiro, 2 para Falso) */}
                {q.tipo === 'verdadeiro_falso' && (
                  <div className="space-y-3">
                    {['Verdadeiro', 'Falso'].map((val, i) => (
                      <label key={val} className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all duration-200 group">
                        <input
                          type="radio"
                          name={q.id}
                          value={i + 1}  // CORREÇÃO: 1 para Verdadeiro, 2 para Falso
                          onChange={() => handleChange(q.id, i + 1)} // CORREÇÃO: Passar o índice
                          checked={respostas[q.id] === (i + 1)} // CORREÇÃO: Comparar com o índice armazenado
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex items-center gap-2">
                          <span className={`text-xl ${val === 'Verdadeiro' ? 'text-green-600' : 'text-red-600'}`}>
                            {val === 'Verdadeiro' ? '✓' : '✗'}
                          </span>
                          <span className="text-gray-700 group-hover:text-gray-900 font-medium transition-colors">{val}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {q.tipo === 'aberta' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Sua resposta:</label>
                    <textarea
                      className="w-full min-h-[120px] p-4 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:ring-purple-400 focus:ring-2 focus:ring-opacity-20 transition-all duration-200 resize-none bg-white"
                      placeholder="Digite sua resposta detalhada aqui..."
                      value={respostas[q.id] || ''}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Seja claro e objetivo em sua resposta</p>
                  </div>
                )}

                {q.tipo === 'numerica' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Resposta numérica:</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full p-4 text-lg border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:ring-orange-400 focus:ring-2 focus:ring-opacity-20 transition-all duration-200 bg-white"
                      placeholder="Digite o número da resposta"
                      value={respostas[q.id] || ''}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Use ponto (.) como separador decimal se necessário</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Pronto para enviar?</p>
                    <p className="text-sm text-green-600">Revise suas respostas antes de finalizar</p>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Enviar Respostas
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default ExercicioOnlinePage;


