
import { ValidationComposite } from '../../../presentation/helper/validators/validation-composite'
import { RequiredFieldValidation } from '../../../presentation/helper/validators/required-field-composite'
import { Validation } from '../../../presentation/protocols/validation'
import { EmailValidatorAdapter } from '../../../utils/email-validator-adapter'
import { EmailValidation } from '../../../presentation/helper/validators/email-validation'

export const makeLoginValidation = (): ValidationComposite => {
  const validations: Validation[] = []
  const fields: string[] = ['email', 'password']
  for (const field of fields) {
    validations.push(new RequiredFieldValidation(field))
  }

  validations.push(new EmailValidation('email', new EmailValidatorAdapter()))
  return new ValidationComposite(validations)
}
