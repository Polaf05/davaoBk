import { useState } from 'react'
import RegisterForm from './RegistrationForm'


function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex justify-center">
      <div className='bg-base-200 p-6 rounded-md m-5 w-full'>
        <RegisterForm />
      </div>

    </div>
  )
}

export default App
