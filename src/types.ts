import { TransactionState } from '@prisma/client';
import { ErrorRequestHandler } from 'express';
/**
 * DISCLAMER: en environnement de développement, la modification de ce fichier ne sera peut-être pas prise en compte par le serveur de dev
 * Redémarrer le serveur dans ce cas là
 */

/*************/
/** General **/
/*************/

export interface DecodedToken {
  vendorId: string;
}

/************************/
/** Databse extensions **/
/************************/

/************/
/** Etupay **/
/************/

export interface EtupayResponse {
  transactionId: number;
  step: TransactionState;
  paid: boolean;
  serviceData: string;
}

export type EtupayError = ErrorRequestHandler & {
  message: string;
};

/**********/
/** Misc **/
/**********/
export const enum Error {
  // More info on https://www.loggly.com/blog/http-status-code-diagram to know where to put an error

  // 400
  // Used when the request contains a bad syntax and makes the request unprocessable
  InvalidBody = 'Corps de la requête invalide',
  MalformedBody = 'Corps de la requête malformé',
  InvalidParameters = 'Paramètres de la requête invalides',
  InvalidQueryParameters = 'Paramètres de la requête invalides (query)',
  EmptyBasket = 'Le panier est vide',

  // 401
  // The vendor credentials were refused or not provided
  Unauthenticated = "Vous n'êtes pas authentifié",
  ExpiredToken = 'Session expirée. Veuillez vous reconnecter',
  InvalidToken = 'Session invalide',
  InvalidCredentials = 'Identifiants invalides',

  // 403
  // The server understood the request but refuses to authorize it*
  AlreadyAuthenticated = 'Vous êtes déjà identifié',

  // 404
  // The server can't find the requested resource
  NotFound = 'La ressource est introuvable',
  RouteNotFound = 'La route est introuvable',
  VendorNotFound = 'Le vendeur est introuvable',
  CartNotFound = 'Le panier est introuvable',
  OrderNotFound = 'La commande est introuvable',

  // 415
  UnsupportedMediaType = "Le format de la requête n'est pas supporté",

  // 500
  // The server encountered an unexpected condition that prevented it from fulfilling the request
  InternalServerError = 'Erreur inconnue',
}
