import { Request, Response } from 'express';
import pool from '../config/db';
import { atualizarEvento, criarEvento, inserirRolesEvento, inserirUsuariosEvento, listarEventos, obterEventosEEnviosDoUsuario, obterRolesEventoDB, obterUsuariosEventoDB, removerEvento, removerRolesEvento, removerUsuariosEvento } from '../models/eventoCalendario';

export const criarNovoEvento = async (req: Request, res: Response) => {
    try {
        const { calendario_id, data, tipo, nome, cor, descricao, importancia, recorrente, roles, usuarios } = req.body;
        const result: any = await criarEvento(pool, { calendario_id, data, tipo, nome, cor, descricao, importancia, recorrente });
        const evento_id = result.insertId;

        if (roles && Array.isArray(roles)) {
            await inserirRolesEvento(pool, evento_id, roles);
        }
        
        if (usuarios && Array.isArray(usuarios)) {
            await inserirUsuariosEvento(pool, evento_id, usuarios);
        }

        res.status(201).json({ message: 'Evento criado com sucesso!', evento_id });
    } catch (error) {
        const err = error as Error;
        res.status(500).json({ error: err.message });
    }
};

export const obterEventos = async (req: Request, res: Response) => {
    try {
        const { calendario_id } = req.params;
        const eventos = await listarEventos(pool, Number(calendario_id));
        res.json(eventos);
    } catch (error) {
        const err = error as Error;
        res.status(500).json({ error: err.message });
    }
};

export const excluirEvento = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await removerEvento(pool, Number(id));
        res.json({ message: 'Evento removido com sucesso!' });
    } catch (error) {
        const err = error as Error;
        res.status(500).json({ error: err.message });
    }
};

export const editarEvento = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data, tipo, nome, cor, descricao, importancia, recorrente, calendario_id, roles, usuarios } = req.body;
        await atualizarEvento(pool, {
            id: Number(id),
            data,
            tipo,
            nome,
            cor,
            descricao,
            importancia,
            recorrente,
            calendario_id
        });

        await removerRolesEvento(pool, Number(id));
        if (roles && Array.isArray(roles)) {
            await inserirRolesEvento(pool, Number(id), roles);
        }
        
        await removerUsuariosEvento(pool, Number(id));
        if (usuarios && Array.isArray(usuarios)) {
            await inserirUsuariosEvento(pool, Number(id), usuarios);
        }

        res.json({ message: 'Evento atualizado com sucesso!' });
    } catch (error) {
        const err = error as Error;
        res.status(500).json({ error: err.message });
    }
};

export const obterUsuariosEvento = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const usuarios = await obterUsuariosEventoDB(pool, Number(id));
        res.json(usuarios);
    } catch (error) {
        const err = error as Error;
        res.status(500).json({ error: err.message });
    }
};

export const obterRolesEvento = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const roles = await obterRolesEventoDB(pool, Number(id));
        res.json(roles);
    } catch (error) {
        const err = error as Error;
        res.status(500).json({ error: err.message });
    }
};

export const obterEventosUsuario = async (req: Request, res: Response) => {
    const { user_id, role } = req.params;
    const userIdNum = Number(user_id);
    if (!user_id || isNaN(userIdNum) || !role) {
        return res.status(400).json({ error: 'Parâmetros inválidos' });
    }
    try {
        const eventos = await obterEventosEEnviosDoUsuario(pool, userIdNum, role);
        res.json(eventos);
    } catch (error) {
        const err = error as Error;
        res.status(500).json({ error: err.message });
    }
}