/* prettier-ignore-start */
/* eslint-disable */
// @ts-nocheck
// noinspection JSUnusedGlobalSymbols

import { Route as rootRoute } from './routes/__root'
import { Route as AuthenticatedImport } from './routes/_authenticated'
import { Route as IndexImport } from './routes/index'
import { Route as LoginImport } from './routes/login'
import { Route as RegisterImport } from './routes/register'
import { Route as VerifyOtpImport } from './routes/verify-otp'
import { Route as AuthenticatedProfileImport } from './routes/_authenticated/profile'

const AuthenticatedRoute = AuthenticatedImport.update({
  id: '/_authenticated',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const LoginRoute = LoginImport.update({
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const RegisterRoute = RegisterImport.update({
  path: '/register',
  getParentRoute: () => rootRoute,
} as any)

const VerifyOtpRoute = VerifyOtpImport.update({
  path: '/verify-otp',
  getParentRoute: () => rootRoute,
} as any)

const AuthenticatedProfileRoute = AuthenticatedProfileImport.update({
  path: '/profile',
  getParentRoute: () => AuthenticatedRoute,
} as any)

export const routeTree = rootRoute.addChildren({
  IndexRoute,
  LoginRoute,
  RegisterRoute,
  VerifyOtpRoute,
  AuthenticatedRoute: AuthenticatedRoute.addChildren({
    AuthenticatedProfileRoute,
  }),
})

/* prettier-ignore-end */
