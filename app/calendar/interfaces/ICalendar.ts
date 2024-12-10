export interface ITag {
  color: string
  name: string
}

export interface BaseObject {
  id: string
  name: string
}

export interface IEvent {
  id?: number
  title: string
  start: string // ISO 8601 format date or date-time string
  end: string // ISO 8601 format date or date-time string
  description: string
  location: string
  backgroundColor: string
  borderColor: string
  textColor: string
  tag: ITag
  identifier?: string
}

export interface GeneralAvailability {
  [key: string]: {
    startTime: string
    endingTime: string
    previewlyKey: string
    nextKey: string
    optionsStartTime: BaseObject[]
    optionsEndingTime: BaseObject[]
    disabled?: boolean
  }
}

export interface IWeekDates {
  sunday: string
  monday: string
  tuesday: string
  wednesday: string
  thursday: string
  friday: string
  saturday: string
};
