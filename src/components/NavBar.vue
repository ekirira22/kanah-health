<script setup>
  import { ref } from 'vue';
  // import { Bar3Icon, XMarkIcon } from '@heroicons/vue/24/solid'

  //Reactive state for mobile menu
  const isMenuOpen = ref(false);

  //Toggle Menu
  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
  }
  toggleMenu();
</script>

<template>
  <nav class="flex justify-between items-center px-4 shadow-md bg-white">
    <!-- Logo  -->
    <div class="flex items-center space-x-2">
      <img src='../assets/logo.svg' alt="Kanah Health" class="w-20 h-20">
      <span class="text-xl font-bold text-gray-700">Kanah Health</span>
    </div>

    <!-- Desktop Menu  -->

    <ul class="hidden md:flex space-x-6 text-gray-700">
      <li><a href="#" class="hover:text-orange-500">Home</a></li>
      <li><a href="#" class="hover:text-orange-500">About Us</a></li>
      <li><a href="#" class="hover:text-orange-500">Services</a></li>
      <li><a href="#" class="hover:text-orange-500">Blog</a></li>
      <li><a href="#" class="hover:text-orange-500">Contact Us</a></li>
    </ul>
    <button class="hidden md:block bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
      Get Started
    </button>
  </nav>
</template>
