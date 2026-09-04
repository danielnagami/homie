import { setGlobalOptions } from 'firebase-functions/v2'
import { initializeApp } from 'firebase-admin/app'

initializeApp()

setGlobalOptions({ region: 'us-central1' })

export { onTaskCompletionCreated, onTaskCompletionDeleted } from './onTaskCompletionCreated.js'
export { resetPeriodTotals } from './resetPeriodTotals.js'