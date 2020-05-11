import { makeSignUpValidation } from './signup-validation'
import { ValidationComposite } from '../../presentation/helper/validators/validation-composite'
import { Validation } from '../../presentation/helper/validators/validation'
import { RequiredFieldValidation } from '../../presentation/helper/validators/required-field-composite'
import { CompareFieldsName } from '../../presentation/helper/validators/compare-fields-validation'

jest.mock('../../presentation/helper/validators/validation-composite')

const validations: Validation[] = []
const fields: string[] = ['name', 'email', 'password', 'passwordConfirmation']

describe('SignUpValidation Factory', () => {
  test('should Call ValidationComposite with all validations', () => {
    makeSignUpValidation()

    for (const field of fields) {
      validations.push(new RequiredFieldValidation(field))
    }

    validations.push(new CompareFieldsName('password', 'passwordConfirmation'))
    expect(ValidationComposite).toHaveBeenCalledWith(validations)
  })
})
