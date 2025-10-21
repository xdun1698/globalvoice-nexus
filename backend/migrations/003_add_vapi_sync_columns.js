/**
 * Migration: Add Vapi Sync Columns
 * Adds columns to support bidirectional sync between Vapi and application database
 */

exports.up = function(knex) {
  return Promise.all([
    // Add Vapi ID columns to phone_numbers table
    knex.schema.table('phone_numbers', function(table) {
      table.string('vapi_phone_id').nullable();
      table.string('vapi_assistant_id').nullable();
      table.index('vapi_phone_id');
    }),
    
    // Ensure agents table has vapi_assistant_id (may already exist)
    knex.schema.hasColumn('agents', 'vapi_assistant_id').then(exists => {
      if (!exists) {
        return knex.schema.table('agents', function(table) {
          table.string('vapi_assistant_id').nullable();
          table.index('vapi_assistant_id');
        });
      }
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    // Remove Vapi ID columns from phone_numbers table
    knex.schema.table('phone_numbers', function(table) {
      table.dropColumn('vapi_phone_id');
      table.dropColumn('vapi_assistant_id');
    }),
    
    // Check if vapi_assistant_id exists before dropping
    knex.schema.hasColumn('agents', 'vapi_assistant_id').then(exists => {
      if (exists) {
        return knex.schema.table('agents', function(table) {
          table.dropColumn('vapi_assistant_id');
        });
      }
    })
  ]);
};
