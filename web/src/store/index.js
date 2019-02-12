import Vue from 'vue'
import Vuex from 'vuex'
import router from '@/router'
import * as firebase from 'firebase/app'
import 'firebase/functions'
import 'firebase/firestore'

Vue.use(Vuex)

const state = {
  error: null,
  success: null,

  viewText: '',
  loadingText: false,
  newText: '',
  canEdit: true,
  newDialog: false,
  canSave: true,
  busySave: false,
  canCopy: false,
  busyCopy: false
}

const getters = {
  getNewText () {
    return state.newText || ''
  },
  canNew () {
    return true
  },
  canSave () {
    return state.canSave && state.newText.length > 0
  }
}

const mutations = {
  setError (state, payload) {
    state.error = payload
    state.success = null
  },
  setSuccess (state, payload) {
    state.success = payload
    state.error = null
  },

  setViewText (state, value) { state.viewText = value },
  setLoadingText (state, value) { state.loadingText = value },

  setNewText (state, value) { state.newText = value },
  setCanEdit (state, value) { state.canEdit = value },
  setNewDialog (state, value) { state.newDialog = value },

  setCanSave (state, value) { state.canSave = value },
  setBusySave (state, value) { state.busySave = value },
  setCanCopy (state, value) { state.canCopy = value },
  setBusyCopy (state, value) { state.busyCopy = value }
}

const actions = {
  newFirebin ({commit, state}) {
    if (router.currentRoute.path === '/') {
      if (state.newText.length > 0) {
        if (state.newDialog === false) {
          commit('setNewDialog', true)
        } else {
          commit('setNewDialog', false)
          commit('setNewText', '')
        }
      }
    } else {
      router.push('/')
    }
  },
  saveFirebin ({commit, state}) {
    commit('setBusySave', true)
    commit('setCanEdit', false)
    let saveFirebinFunc = firebase.functions().httpsCallable('saveFirebin')
    saveFirebinFunc({
      data: state.newText,
      encoding: ''
    }).then(res => {
      commit('setSuccess', 'Successfully saved firebin')
      commit('setNewText', '')
      commit('setCanEdit', true)
      commit('setBusySave', false)
      router.push('/v/' + res.data.binId)
    }).catch(err => {
      console.log(err)
      commit('setError', 'Could not save firebin')
      commit('setCanEdit', true)
      commit('setBusySave', false)
    })
  },
  loadFirebin ({commit, state}, binId) {
    commit('setLoadingText', true)

    return firebase.firestore().collection('firebin').doc(binId).get()
      .then(doc => {
        commit('setViewText', doc.get('data'))
        commit('setCanCopy', true)
        commit('setLoadingText', false)
      }).catch(err => {
        console.log(err)
        commit('setError', 'Could not load firebin')
        commit('setLoadingText', false)
        router.push('/NotFound')
      })
  },
  copyFirebin ({commit, state}, key) {
    commit('setNewText', state.viewText)
    commit('setSuccess', 'You can now edit the copy')
    router.push('/')
  }
}

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  strict: process.env.NODE_ENV !== 'production'
})
