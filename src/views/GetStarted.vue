<script setup>
import { ref } from 'vue'
import { SignupModal, LoginModal } from '../components'

const showSignupModal = ref(false)
const showLoginModal = ref(false)

</script>

<template>
  <section class="flex flex-col md:flex-row items-center justify-between p-4 md:p-8 gap-6 md:gap-8">
    <div class="w-full md:w-1/2 space-y-4">
      <div class="flex justify-center">
        <img src="../assets/img/baby-mother-illustration.png" alt="Mother and Baby" class="w-full max-w-md object-cover">
      </div>
    </div>
    <div class="w-full md:w-1/2 space-y-8 md:space-y-20 text-center md:text-left">
      <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800">
        Your Baby Is Part of Our Family
      </h1>
      <p class="text-base md:text-lg text-gray-600">
        Lorem ipsum dolor sit amet consectetur. Dignissim ut purus auctor amet a lectus cursus erat.
      </p>
      <div class="flex flex-col space-y-4 w-full md:w-3/4 mx-auto md:mx-0">
        <button 
          @click="showLoginModal = true"
          class="border border-gray-700 text-gray-700 px-6 py-2 rounded-lg hover:cursor-pointer"
        >
          Login →
        </button>
        <button 
          @click="showSignupModal = true"
          class="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 hover:cursor-pointer"
        >
          Sign Up →
        </button>
      </div>
    </div>
  </section>

  <!-- Signup Modal -->
  <SignupModal 
    v-if="showSignupModal" 
    @close="showSignupModal = false"
  />

  <!-- Login Modal -->
  <LoginModal 
    v-if="showLoginModal" 
    @close="showLoginModal = false"
  />
</template>
