import { ref } from "vue"

import BottomDialog from "@/components/BottomDialog/index.js"
import EventService from "@/services/event"
import type { Event } from "@/models/event"
import type { BottomDialogConfig } from "@/components/BottomDialog/types"
const events = ref(Array<Event>())
const setEvents = () => {
  EventService.getAll()
    .then(res => {
      events.value = res
    })
    .catch(err => {
      // TODO handle
      console.log(err)
    })
}

const getLastLog = (e: Event) => {
  if (e.logs == null) {
    return null
  } else {
    const last = e.logs[e.logs.length - 1]
    console.log(last)
    return e.logs[e.logs.length - 1]
  }
}

const eventBottomDialog = (config: BottomDialogConfig) => {
  // TODO condition
  BottomDialog(config).then(() => setEvents())
}

const acceptEvent = (event: Event) => {
  BottomDialog({
    subject: "接受事件",
    content: [
      {
        key: "型号",
        value: event.model,
      },
      {
        key: "问题描述",
        value: event.problem,
      },
      {
        key: "创建时间",
        value: event.gmtCreate,
      },
    ],
    acceptAction: () => {
      return EventService.accept(event.eventId)
    },
  }).then(() => {
    setEvents()
  })
}

const commitEvent = (event: Event) => {
  eventBottomDialog({
    subject: "提交维修",
    formList: [
      {
        subject: "维修描述",
        id: "description",
        required: true,
        type: "textarea",
      },
    ],
    rounded: true,
    content: [
      {
        key: "型号",
        value: event.model,
      },
      {
        key: "问题描述",
        value: event.problem,
      },
      {
        key: "创建时间",
        value: event.gmtCreate,
      },
    ],
    acceptActionName: "提交",
    acceptAction: e => {
      return EventService.commit(event.eventId, e.description)
    },
  })
}

const alterCommit = (event: Event) => {
  EventService.getMemberEvent(event.eventId).then(res => {
    // TODO if last log action is not commit ?????????
    eventBottomDialog({
      subject: "修改提交",
      formList: [
        {
          subject: "维修描述",
          id: "description",
          required: true,
          type: "textarea",
          val: getLastLog(res)?.description,
        },
      ],
      rounded: true,
      content: [
        {
          key: "型号",
          value: event.model,
        },
        {
          key: "问题描述",
          value: event.problem,
        },
        {
          key: "创建时间",
          value: event.gmtCreate,
        },
      ],
      acceptActionName: "提交",
      acceptAction: e => {
        return EventService.alterCommit(event.eventId, e.description)
      },
    })
  })
}

const dropEvent = (event: Event) => {
  eventBottomDialog({
    subject: "放弃事件",
    confirmMessage: "放弃",
    content: [
      {
        key: "型号",
        value: event.model,
      },
      {
        key: "问题描述",
        value: event.problem,
      },
      {
        key: "创建时间",
        value: event.gmtCreate,
      },
    ],
    acceptAction: () => {
      return EventService.drop(event.eventId)
    },
  })
}

const judgeSubmit = async (event: Event) => {
  eventBottomDialog({
    subject: "审核提交",
    acceptActionName: "通过",
    declineActionName: "退回",
    rounded: true,
    content: [
      {
        key: "型号",
        value: event.model,
      },
      {
        key: "问题描述",
        value: event.problem,
      },
      {
        key: "维修描述",
        value: getLastLog(event)?.description || "",
      },
      {
        key: "提交时间",
        value: event.gmtCreate,
      },
    ],
    acceptAction: () => {
      return EventService.close(event.eventId)
    },
    declineAction: () => {
      return EventService.rejectCommit(event.eventId)
    },
  })
}

export { setEvents, events, acceptEvent, commitEvent, alterCommit, dropEvent, judgeSubmit }
