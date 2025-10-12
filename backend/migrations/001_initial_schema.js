exports.up = function(knex) {
  return knex.schema
    .createTable('users', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.string('email').unique().notNullable();
      table.string('password').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('agents', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('name').notNullable();
      table.text('description');
      table.text('greeting');
      table.string('language').defaultTo('en');
      table.string('voice').defaultTo('female');
      table.string('personality').defaultTo('professional');
      table.jsonb('intents');
      table.jsonb('workflows');
      table.boolean('enable_voice_cloning').defaultTo(false);
      table.string('status').defaultTo('active');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('phone_numbers', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('agent_id').references('id').inTable('agents').onDelete('SET NULL');
      table.string('number').unique().notNullable();
      table.string('twilio_sid');
      table.string('country_code');
      table.jsonb('capabilities');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('calls', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('agent_id').references('id').inTable('agents').onDelete('SET NULL');
      table.string('phone_number').notNullable();
      table.string('direction').notNullable();
      table.string('status').notNullable();
      table.string('twilio_sid');
      table.integer('duration');
      table.string('recording_url');
      table.string('recording_sid');
      table.integer('recording_duration');
      table.string('detected_language');
      table.jsonb('context');
      table.float('csat_score');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('call_transcripts', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('call_id').references('id').inTable('calls').onDelete('CASCADE');
      table.string('speaker').notNullable();
      table.text('text').notNullable();
      table.string('language');
      table.float('confidence');
      table.timestamp('timestamp').defaultTo(knex.fn.now());
    })
    .createTable('contacts', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('name');
      table.string('phone');
      table.string('email');
      table.string('company');
      table.text('notes');
      table.jsonb('tags');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('integrations', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('provider').notNullable();
      table.jsonb('credentials');
      table.string('status').defaultTo('active');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('integrations')
    .dropTableIfExists('contacts')
    .dropTableIfExists('call_transcripts')
    .dropTableIfExists('calls')
    .dropTableIfExists('phone_numbers')
    .dropTableIfExists('agents')
    .dropTableIfExists('users');
};
