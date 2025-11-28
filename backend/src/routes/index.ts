import { Hono } from 'hono'
import { Env } from '../app'
import auth from './auth/auth'
import users from './users/users'
import petsitters from './petsitters/petsitters'
import bookings from './bookings/bookings'

export const routes = (app: Hono<Env>) => {
    app.route('/auth', auth)
    app.route('/users', users)
    app.route('/petsitters', petsitters)
    app.route('/bookings', bookings)
};