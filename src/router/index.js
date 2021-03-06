import Vue from 'vue'
import Router from 'vue-router'
import CesiumScene from '@/views/CesiumScene.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'Cesium',
      component: CesiumScene
    }
  ]
})