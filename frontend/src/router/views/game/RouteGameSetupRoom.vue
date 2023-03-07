<script setup lang='ts'>
import { ref } from 'vue'
import { getRndGradient } from '../../../bin/color'
import { useUser } from '../../../store/user'

const users = useUser()
</script>

<template>
  <div class="game-configure">
    <div class="col col-players">
      <div class="col-header">
        <strong>Players</strong>

        <button class="button btn-highlight-text">
          <Icon code="e7fe" size="1.6" />
          Invite
        </button>
      </div>

      <div class="col-content">
        <div v-for="user in users.users.slice(0, 10)" :key="user.username" class="game-user">
          <div class="image-wrap">
            <img v-if="user.profilePicture" :src="user.profilePicture">
            <div v-else :style="{ backgroundColor: getRndGradient() }">
              {{ user.username[0] }}
            </div>
          </div>

          <span>{{ user.username }}</span>

          <div class="user-attrs">
            <button class="button btn-gray btn-round" data-title-top="Kick user">
              <Icon code="ef66" size="2" />
            </button>

            <button class="button btn-gray btn-round" data-title-top="Make Admin">
              <Icon code="ea3d" size="2" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="col col-configure">
      <div class="col-header">
        <strong>Gamae Settings</strong>
        <button class="button btn-white">
          Reset
        </button>
      </div>
    </div>
    game created (in of game in url), waiting to start

    (opening this page with the link will automatically register you unless you already are)

    this is where we list users and create
  </div>
</template>
