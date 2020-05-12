import jwt from 'jsonwebtoken'
import { JwtAdapter } from './jwt-adapter'

jest.mock('jsonwebtoken', () => ({
  async sign (): Promise<string> {
    return await 'valid_token'
  }
}))

describe('Jwt Adapter', () => {
  test('should call sign with correct values', async () => {
    const sut = new JwtAdapter('secret')
    const signSpy = jest.spyOn(jwt, 'sign')
    await sut.encrypt('valid_id')
    expect(signSpy).toHaveBeenCalledWith({ id: 'valid_id' }, 'secret')
  })

  test('should return a token on sign success', async () => {
    const sut = new JwtAdapter('secret')
    const accessToken = await sut.encrypt('valid_id')
    expect(accessToken).toBe('valid_token')
  })

  test('should throws if sign throws', async () => {
    const sut = new JwtAdapter('secret')
    jest.spyOn(jwt, 'sign').mockImplementationOnce(() => {
      throw new Error()
    })
    const accessToken = sut.encrypt('valid_id')
    await expect(accessToken).rejects.toThrow()
  })
})
