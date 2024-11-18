import {  Hono } from 'hono'
import bookings from './bookings'
import petsitters from './petsitters'
import users from './users'


type Env={
    Bindings: {
      DATABASE_URL: string
      JWT_SECRET:string
    }
    Variables: {
      userId: string
    }
    strict: false
  }

export const routes = (app: Hono<Env>) => {

    app.route('/users', users)
    app.route('/petsitters', petsitters)
    app.route('/bookings', bookings)
  };