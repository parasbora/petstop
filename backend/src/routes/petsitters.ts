import { Hono } from 'hono'


const petsitters = new Hono()

petsitters.get('/', c => c.text('petstop petsitters:')) // GET /user


export default petsitters