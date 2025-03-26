<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { supabase } from '../lib/supabase'
import { useToast } from 'vue-toastification'

const toast = useToast()
const router = useRouter()
const emit = defineEmits(['close'])

const formData = ref({
  name: '',
  email: '',
  password: ''
})
const loading = ref(false)
const error = ref(null)

const handleSignup = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Sign up with Supabase
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.value.email,
      password: formData.value.password,
      options: {
        data: {
          name: formData.value.name
        }
      }
    })

    if (signUpError) throw signUpError

    // Redirect to dashboard
    toast.success("Successfully signed up")
    router.push('/dashboard')
  } catch (e) {
    error.value = e.message
    toast.error(error.value, { timeout: 5000 })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl p-8 w-full max-w-md relative">
      <!-- Close button -->
      <button 
        @click="emit('close')" 
        class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 font-semibold text-2xl"
      >
        x
      </button>

      <!-- Logo -->
      <div class="flex justify-center mb-6">
        <img src="../assets/icons/logo1.png" alt="Kanah Health" class="h-30 lg:h-40">
      </div>

      <!-- Social Login Buttons -->
      <button class="w-full mb-3 flex items-center justify-center gap-2 border rounded-lg py-1 px-4 hover:bg-gray-50">
        <img src="../assets/icons/g.png" alt="Google" class="w-10 h-10">
        Signup with Google
      </button>
      <button class="w-full mb-6 flex items-center justify-center gap-2 border rounded-lg py-2 px-4 hover:bg-gray-50">
        <img src="../assets/icons/a.png" alt="Apple" class="w-6 h-8">
        Signup with Apple
      </button>

      <div class="text-center text-gray-500 mb-6">OR</div>

      <!-- Sign Up Form -->
      <form @submit.prevent="handleSignup" class="space-y-4">
        <input
          v-model="formData.name"
          type="text"
          placeholder="Name"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        >
        <input
          v-model="formData.email"
          type="email"
          placeholder="Email"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        >
        <input
          v-model="formData.password"
          type="password"
          placeholder="Password"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        >

        <div class="flex items-start mb-4">
          <input type="checkbox" required class="mt-1 mr-2">
          <span class="text-sm text-gray-600">
            By clicking Sign Up, you agree to our Terms of Service and Privacy Policy,
            confirming that you have read and understand how your personal information
            will be used and stored
          </span>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          {{ loading ? 'Signing up...' : 'Sign Up' }}
        </button>

        <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
      </form>
    </div>
  </div>
</template>
