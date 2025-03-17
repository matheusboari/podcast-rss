import { Request, Response, NextFunction } from 'express';
import { JWT_SECRET } from '../../settings';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Para fins de teste, vamos permitir acesso sem autenticação
  // Em produção, você deve implementar uma autenticação adequada
  next();
}; 