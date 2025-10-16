/**
 * Migration: Expand personality field to text type
 * 
 * The personality field was limited to 255 characters (varchar)
 * but needs to store detailed expertise and knowledge (text)
 */

exports.up = function(knex) {
  return knex.schema.alterTable('agents', table => {
    table.text('personality').alter();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('agents', table => {
    table.string('personality').alter();
  });
};
