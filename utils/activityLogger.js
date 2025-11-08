const ActivityLogger = require('../models/activityLogger');

const logActivity = async ({ action, entity, entityId, ipAddress, userId, oldData = {}, newData = {} }) => {
  try {
    if (!userId || !action || !entity) {
      console.warn('Missing required log fields:', { userId, action, entity });
      return;
    }

    let description = '';

    switch(action) {
      case 'CREATE':
        description = `Created a new ${entity} with ID: ${entityId}`;
        break;
      case 'UPDATE':
        const changes = [];
        for (const key in newData) {
          if (String(newData[key]) !== String(oldData[key])) {
            changes.push(`"${key}" changed from "${oldData[key] || '-'}" → "${newData[key] || '-'}"`);
          }
        }
        if (changes.length === 0) return;
        description = changes.join('; ');
        break;
      case 'DELETE':
        description = `Deleted ${entity} record with ID: ${entityId}`;
        break;
      case 'LOGIN':
        // Include full name if available
        const fullName = `${newData.first_name || ''} ${newData.last_name || ''}`.trim();
        description = fullName
          ? `${entity} "${fullName}" with email "${newData.email}" logged in`
          : `${entity} with email "${newData.email}" logged in`;
        break;
      default:
        description = `${action} action performed on ${entity}`;
    }

    const log = await ActivityLogger.create({
      userId,
      action,
      entity,
      entityId,
      ipAddress: ipAddress || '127.0.0.1',
      description,
      timestamp: new Date(),
    });

    console.log('Activity logged:', log);

  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

module.exports = logActivity;
