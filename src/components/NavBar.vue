<script setup>
  import { ref } from 'vue';
  import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/solid'
  import { useRouter } from 'vue-router';

  const router = useRouter();

  //Reactive state for mobile menu
  const isMenuOpen = ref(false);

  //Toggle Menu
  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
  }
</script>

<template>
  <nav class="flex justify-between items-center px-4 shadow-md bg-white">
    <!-- Logo  -->
    <div class="flex items-center cursor-pointer" @click="router.push('/')">
      <img src='../assets/logo.svg' alt="Kanah Health" class="w-20 h-20">
      <span class="text-xl font-bold text-gray-700">Kanah Health</span>
    </div>

    <!-- Desktop Menu  -->

    <ul class="hidden lg:flex space-x-6 text-gray-700">
      <li><a href="#" class="hover:text-orange-500"><router-link to="/">Home</router-link></a></li>
      <li><a href="#" class="hover:text-orange-500">About Us</a></li>
      <li><a href="#" class="hover:text-orange-500">Services</a></li>
      <li><a href="#" class="hover:text-orange-500">Blog</a></li>
      <li><a href="#" class="hover:text-orange-500">Contact Us</a></li>
    </ul>

    <!-- Get Started Button (Always Visible) -->
    <button 
      class="hidden lg:block bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
      @click="router.push('/get-started')"
    >
      Get Started
    </button>

    <!-- Mobile Hamburger Menu Button  -->
     <button @click="toggleMenu" class="lg:hidden hover:cursor-pointer">
      <Bars3Icon v-if="!isMenuOpen" class="w-8 h-8 text-gray-700 transition duration-300 ease-in-out" />
     </button>

    <!-- Mobile Menu Dropdown  -->
     <transition name="fade">
      <div v-if="isMenuOpen" class="lg:hidden absolute top-0 left-0 w-full m-auto p-12 bg-white opacity-97 shadow-md">
        <div class="flex justify-between">
          <div class="flex items-center cursor-pointer" @click="router.push('/') && toggleMenu()">
            <img src='../assets/logo.svg' alt="Kanah Health" class="w-15 h-15">
            <span class="text-sm font-bold text-gray-700">Kanah Health</span>
          </div>
          <button @click="toggleMenu" class="hover:cursor-pointer">
            <XMarkIcon class="w-8 h-8 text-gray-700 transition duration-300 ease-in-out" />
          </button>
        </div>
        <ul class="flex flex-col items-center space-y-4 py-4 text-gray-700">
          <li><a href="#" class="hover:text-orange-500"><router-link to="/" @click="toggleMenu()">Home</router-link></a></li>
          <li><a href="#" class="hover:text-orange-500">About Us</a></li>
          <li><a href="#" class="hover:text-orange-500">Services</a></li>
          <li><a href="#" class="hover:text-orange-500">Blog</a></li>
          <li><a href="#" class="hover:text-orange-500">Contact Us</a></li>
          <button 
            @click="router.push('/get-started') && toggleMenu()"
            class="bg-orange-500 text-white text-center px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Get Started
          </button>
        </ul>
      </div>
    </transition>
  </nav>
</template>

<style scoped>
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.4s ease;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>
