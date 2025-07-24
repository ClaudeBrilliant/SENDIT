export enum Permission {
  // User Management
  CREATE_USER = 'create_user',
  READ_USER = 'read_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  MANAGE_USERS = 'manage_users',

  // Parcel Management
  CREATE_PARCEL = 'create_parcel',
  READ_PARCEL = 'read_parcel',
  UPDATE_PARCEL = 'update_parcel',
  DELETE_PARCEL = 'delete_parcel',
  ASSIGN_COURIER = 'assign_courier',
  UPDATE_PARCEL_STATUS = 'update_parcel_status',
  TRACK_PARCEL = 'track_parcel',

  // Courier Management
  CREATE_COURIER = 'create_courier',
  READ_COURIER = 'read_courier',
  UPDATE_COURIER = 'update_courier',
  DELETE_COURIER = 'delete_courier',

  // Order Management
  CREATE_ORDER = 'create_order',
  READ_ORDER = 'read_order',
  UPDATE_ORDER = 'update_order',
  DELETE_ORDER = 'delete_order',

  // Notification Management
  SEND_NOTIFICATION = 'send_notification',
  READ_NOTIFICATION = 'read_notification',

  // Analytics/Reports
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_DATA = 'export_data',

  // System/Admin
  MANAGE_SYSTEM = 'manage_system',
  ACCESS_ADMIN_PANEL = 'access_admin_panel',
  MANAGE_PERMISSIONS = 'manage_permissions',
}
