// src/pages/gestor/FeedsPageMenu.tsx

import React from 'react';
import { useState } from 'react';
import { FaHeart, FaRegHeart, FaRegComment, FaRegShareFromSquare } from 'react-icons/fa6';
import InteractiveCards from '../gestor/components/InteractiveCards'; // ajuste o caminho conforme seu projeto



const FeedsPageMenu = () => {

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-6">

        <div className="container mx-auto p-4">
          <div className="space-y-6">
            {/* STORIES */}
            <div className="flex justify-center">
              <div className="flex space-x-6 overflow-x-auto max-w-2xl w-full px-4">
                {[
                  { nome: 'Marcelo F.', imagem: 'https://i.pravatar.cc/150?img=52' },
                  { nome: 'Rodrigo F.', imagem: 'https://i.pravatar.cc/150?img=53' },
                  { nome: 'Lucas F.', imagem: 'https://i.pravatar.cc/150?img=59' },
                  { nome: 'Victor Mat.', imagem: 'https://i.pravatar.cc/150?img=51' },
                  { nome: 'Marco A.', imagem: 'https://i.pravatar.cc/150?img=61' },
                  { nome: 'Yuri L.', imagem: 'https://i.pravatar.cc/150?img=1' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <img
                      src={item.imagem}
                      alt={item.nome}
                      className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
                    />
                    <span className="mt-2 text-base font-medium">{item.nome}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* NOVO POST */}
        <div className="flex flex-col space-y-4 max-w-2xl mx-auto w-full">
          <div className="flex items-center space-x-4">
            <img src="/profile.png" alt="Usuário" className="w-12 h-12 rounded-full object-cover" />
            <input
              type="text"
              placeholder="Alguma coisa sobre..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex justify-between">
            <button className="flex-1 bg-red-500 text-white px-4 py-2 rounded-full mx-1">
              Vídeo ao vivo
            </button>
            <button className="flex-1 bg-green-500 text-white px-4 py-2 rounded-full mx-1">
              Foto/Vídeo
            </button>
            <button className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-full mx-1">
              Sentimento/Atividade
            </button>
          </div>
        </div>


        {/* FEED DE POSTS */}
        <div className="space-y-6">
          {/* Post 1 */}
          <div className="max-w-2xl mx-auto border border-gray-200 rounded-lg p-6 shadow-md bg-white mb-6">
            <div className="flex items-center space-x-6">
              <img src="" alt="Will Dev" className="w-12 h-12 rounded-full object-cover border border-gray-300" />
              <div>
                <h2 className="font-semibold">Will Dev</h2>
                <p className="text-sm text-gray-500">16/04/2022 21:24:17</p>
              </div>
            </div>

            <p className="mt-4 text-gray-700">mais um post para js</p>
            <img src="" alt="JS Post" className="mt-4 w-full rounded-lg object-cover" />

            <div className='feed-organizations'>
              <br></br><div className="feed-buttons">
                <InteractiveCards curtidasIniciais={201} comentariosIniciais={38} />
              </div>
            </div>
          </div>
        </div>

        {/* Post 2 */}
        <div className="max-w-2xl mx-auto border border-gray-200 rounded-lg p-6 shadow-md bg-white mb-6">
          <div className="flex items-center space-x-6">
            <img src="https://i.imgur.com/K29nmAh.jpeg" alt="Maria Lima"
              className="w-12 h-12 rounded-full object-cover border border-gray-300"
            />
            <div>
              <h2 className="font-semibold text-gray-800">Maria Lima</h2>
              <p className="text-sm text-gray-500">17/04/2022 10:15:00</p>
            </div>
          </div>
          <p className="mt-4 text-gray-700">Meu projeto de química está pronto! 🧪</p>
          <img src="https://i.imgur.com/6HSzoW6.jpeg" alt="Química" className="mt-4 w-full rounded-lg object-cover" />


          <div className='feed-organizations'>
            <br></br><div className="feed-buttons">
              <InteractiveCards curtidasIniciais={201} comentariosIniciais={38} />
            </div>
          </div>
        </div>

        {/* Post 3 */}
        <div className="max-w-2xl mx-auto border border-gray-200 rounded-lg p-6 shadow-md bg-white mb-6">
          <div className="flex items-center space-x-6">
            <img src="https://i.imgur.com/BJ005KS.jpeg" alt="Carlos Silva" className="w-12 h-12 rounded-full object-cover border border-gray-300" />
            <div>
              <h2 className="font-semibold text-gray-800">Carlos Silva</h2>
              <p className="text-sm text-gray-500">18/04/2022 14:20:45</p>
            </div>
          </div>
          <p className="mt-4 text-gray-700">Desenvolvendo uma IA para reconhecimento facial 🤖</p>
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRUcW0z_l8_zjXlCi-XqruvJBpjcFehCU2sw&s" alt="IA" className="mt-4 w-full rounded-lg object-cover" />


          <div className='feed-organizations'>
            <br></br><div className="feed-buttons">
              <InteractiveCards curtidasIniciais={201} comentariosIniciais={38} />
            </div>
          </div>
        </div>

        {/* Post 4 */}
        <div className="max-w-2xl mx-auto border border-gray-200 rounded-lg p-6 shadow-md bg-white mb-6">
          <div className="flex items-center space-x-6">
            <img src="https://i.imgur.com/ZwyMiOf.jpeg" alt="Ana Beatriz" className="w-12 h-12 rounded-full object-cover border border-gray-300" />
            <div>
              <h2 className="font-semibold text-gray-800">Ana Beatriz</h2>
              <p className="text-sm text-gray-500">19/04/2022 08:00:00</p>
            </div>
          </div>
          <p className="mt-4 text-gray-700">Consegui finalizar meu trabalho de Física Quântica! 👩‍🔬</p>
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCHe-xDTY87DauWwrtchlUClgh6ZSJdVS4MQ&s" alt="Trabalho de Física" className="mt-4 w-full rounded-lg object-cover" />


          <div className='feed-organizations'>
            <br></br><div className="feed-buttons">
              <InteractiveCards curtidasIniciais={201} comentariosIniciais={38} />
            </div>
          </div>
        </div>

        {/* Post 5 */}
        <div className="max-w-2xl mx-auto border border-gray-200 rounded-lg p-6 shadow-md bg-white mb-6">
          <div className="flex items-center space-x-6">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5UxIgMgyMWOx0LPwz67OOELV-AOjLjCe1Bw&s" alt="Leonardo Rocha" className="w-12 h-12 rounded-full object-cover border border-gray-300" />
            <div>
              <h2 className="font-semibold text-gray-800">Leonardo Rocha</h2>
              <p className="text-sm text-gray-500">19/04/2022 16:45:12</p>
            </div>
          </div>
          <p className="mt-4 text-gray-700">Primeiro protótipo do nosso app educacional 🚀</p>
          <img src="https://i.imgur.com/ie2pkRL.jpeg" alt="Protótipo App" className="mt-4 w-full rounded-lg object-cover" />


          <div className='feed-organizations'>
            <br></br><div className="feed-buttons">
              <InteractiveCards curtidasIniciais={201} comentariosIniciais={38} />
            </div>
          </div>
        </div>

        {/* Post 6 */}
        <div className="max-w-2xl mx-auto border border-gray-200 rounded-lg p-6 shadow-md bg-white mb-6">
          <div className="flex items-center space-x-6">
            <img src="https://i.imgur.com/vskZdiz.jpeg" alt="Juliana Costa" className="w-12 h-12 rounded-full object-cover border border-gray-300" />
            <div>
              <h2 className="font-semibold text-gray-800">Juliana Costa</h2>
              <p className="text-sm text-gray-500">20/04/2022 11:22:33</p>
            </div>
          </div>
          <p className="mt-4 text-gray-700">Participando de uma competição de robótica 🤖🔥</p>
          <img src="https://i.imgur.com/PhpWQlq.jpeg" alt="Competição de robótica" className="mt-4 w-full rounded-lg object-cover" />


          <div className='feed-organizations'>
            <br></br><div className="feed-buttons">
              <InteractiveCards curtidasIniciais={201} comentariosIniciais={38} />
            </div>
          </div>
        </div>


      </div>


    </div>
  );
};

export default FeedsPageMenu;
