<script setup>

import { useRoute } from 'vue-router';

import { NavBar } from './components'

const route = useRoute();
console.log(route.name)

</script>

<template>
 <div class="font-sans h-screen w-full md:overflow-hidden">
    <!-- Show Navbar on all views except dashboard -->

    <NavBar v-if="route.name !== 'Dashboard'"/>
    
    <!-- Dynamic Rendering of Routes  -->
    <router-view />
  </div>
</template>
