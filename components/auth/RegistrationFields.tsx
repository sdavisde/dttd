import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface RegistrationFieldsProps {
  firstName: string
  setFirstName: (value: string) => void
  lastName: string
  setLastName: (value: string) => void
  gender: 'male' | 'female'
  setGender: (value: 'male' | 'female') => void
}

export default function RegistrationFields({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  gender,
  setGender,
}: RegistrationFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-3">
        <Label>Gender</Label>
        <RadioGroup
          value={gender}
          onValueChange={(value) => setGender(value as 'male' | 'female')}
          className="flex flex-row space-x-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female">Female</Label>
          </div>
        </RadioGroup>
      </div>
    </>
  )
}
