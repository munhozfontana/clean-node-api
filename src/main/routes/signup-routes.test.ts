import request from 'supertest'
import app from '../config/app'

describe('SignUp Routes', () => {
  test('Should Return an account on success', async () => {
    await request(app)
      .post('/api/signup')
      .send({
        name: 'Luis',
        email: 'luis@gmail.com',
        password: '123',
        passwordConfirmation: '123'
      })
      .expect(200)
  })
})
