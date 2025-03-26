<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useRouter } from 'vue-router'

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

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = null
    
    //Login with Supabase
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: formData.value.email,
      password: formData.value.password
    })

    if (loginError) throw loginError

    // Redirect to dashboard
    toast.success("Successfully logged in")
    router.push('/dashboard')

  } catch (e) {
    error.value = e.message
    toast.error(e.message, { timeout: 5000 })
    formData.value = {
      email: '',
      password: ''
    }
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
        Continue with Google
      </button>
      <button class="w-full mb-6 flex items-center justify-center gap-2 border rounded-lg py-2 px-4 hover:bg-gray-50">
        <img src="../assets/icons/a.png" alt="Apple" class="w-6 h-8">
        Continue with Apple
      </button>

      <div class="text-center text-gray-500 mb-6">OR</div>

      <!-- Login Form -->
      <div class="text-center text-gray-500 mb-6">Login to your account</div>
      <form @submit.prevent="handleLogin" class="space-y-4">
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
        <!-- Confirm user is not a robot -->
        
        
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          {{ loading ? 'Logging in...' : 'Log In' }}
        </button>

        <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
      </form>
    </div>
  </div>
</template>
