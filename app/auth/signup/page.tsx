"use client"

import { CREATE_USER, DELETE_USER, UPDATE_USER } from "@/graphql/mutations"
import { useMutation } from "@apollo/client"

const page = () => {
  const [createUser] = useMutation(CREATE_USER)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get("email")
    const username = formData.get("username")
    const password = formData.get("password")

    try {
      await createUser({ variables: { email, username, password } })
      console.log("User created successfully")
      // Handle successful signup (e.g., redirect or show a success message)

    } catch (error) {
      // Handle error (e.g., show an error message)
      console.error("Error creating user:", error)
    }
  }

  return (
    <div>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input type="email" name="email" />
        </label>
        <label>
          Username:
          <input type="text" name="username" />
        </label>
        <label>
          Password:
          <input type="password" name="password" />
        </label>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  )
}

export default page