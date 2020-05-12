export const state = () => ({
  data: {},
})

export const mutations = {
  setPartnersData(state, data) {
    state.data = data
  },
}

export const actions = {
  fetchPartnersData() {
    return this.$axios.get(
      'https://api.mirrormedia.mg/partners?max_results=25&page=1'
    )
  },
}
