/**
 * Migration: Enhanced Context for Agents
 * Adds conversation history, customer profiles, and knowledge base
 */

exports.up = function(knex) {
  return knex.schema
    // 1. Enhance agents table with context fields
    .alterTable('agents', table => {
      table.text('system_prompt');
      table.integer('context_window').defaultTo(10);
      table.specificType('knowledge_base_ids', 'UUID[]');
      table.jsonb('business_rules').defaultTo('[]');
      table.string('conversation_style').defaultTo('professional');
      table.text('special_instructions');
    })
    
    // 2. Create conversation_history table
    .createTable('conversation_history', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('call_id').references('id').inTable('calls').onDelete('CASCADE');
      table.uuid('agent_id').references('id').inTable('agents').onDelete('CASCADE');
      table.string('customer_phone', 20).notNullable();
      table.integer('turn_number').notNullable();
      table.string('speaker', 10).notNullable(); // 'agent' or 'customer'
      table.text('message').notNullable();
      table.string('intent', 100);
      table.jsonb('entities');
      table.string('sentiment', 20);
      table.float('confidence');
      table.timestamp('timestamp').defaultTo(knex.fn.now());
      
      table.index('customer_phone');
      table.index(['agent_id', 'call_id']);
      table.index('timestamp');
    })
    
    // 3. Create call_sessions table
    .createTable('call_sessions', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('call_id').references('id').inTable('calls').onDelete('CASCADE');
      table.string('customer_phone', 20).notNullable();
      table.uuid('agent_id').references('id').inTable('agents').onDelete('SET NULL');
      table.jsonb('context').notNullable().defaultTo('{}');
      table.string('conversation_state', 50).defaultTo('greeting');
      table.jsonb('collected_info').defaultTo('{}');
      table.jsonb('pending_actions').defaultTo('[]');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.index('call_id');
      table.index('customer_phone');
    })
    
    // 4. Create customer_profiles table
    .createTable('customer_profiles', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('phone', 20).unique().notNullable();
      table.string('name');
      table.string('email');
      table.string('company');
      table.string('language_preference', 10);
      table.string('timezone', 50);
      
      // Interaction history
      table.integer('total_calls').defaultTo(0);
      table.integer('successful_calls').defaultTo(0);
      table.integer('average_call_duration');
      table.timestamp('last_call_date');
      
      // Behavioral insights
      table.string('preferred_contact_time', 50);
      table.string('communication_style', 50); // formal, casual, technical
      table.string('sentiment_trend', 20); // improving, declining, stable
      table.float('average_sentiment_score');
      
      // Business context
      table.string('customer_segment', 50);
      table.decimal('lifetime_value', 10, 2);
      table.string('account_status', 50);
      
      // Preferences
      table.jsonb('preferences').defaultTo('{}');
      table.jsonb('custom_fields').defaultTo('{}');
      table.specificType('tags', 'TEXT[]');
      
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.index('phone');
      table.index('user_id');
      table.index('email');
    })
    
    // 5. Create knowledge_base table
    .createTable('knowledge_base', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('agent_id').references('id').inTable('agents').onDelete('SET NULL');
      table.string('category', 100).notNullable();
      table.string('title', 255).notNullable();
      table.text('content').notNullable();
      table.jsonb('metadata').defaultTo('{}');
      table.specificType('tags', 'TEXT[]');
      table.string('language', 10).defaultTo('en');
      table.integer('priority').defaultTo(0);
      table.string('status', 20).defaultTo('active');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.index('category');
      table.index('agent_id');
      table.index('user_id');
      table.index('status');
    })
    
    // 6. Create call_insights table
    .createTable('call_insights', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('call_id').references('id').inTable('calls').onDelete('CASCADE');
      table.string('customer_phone', 20).notNullable();
      
      // Extracted information
      table.specificType('key_topics', 'TEXT[]');
      table.specificType('mentioned_products', 'TEXT[]');
      table.specificType('pain_points', 'TEXT[]');
      table.specificType('questions_asked', 'TEXT[]');
      table.specificType('objections', 'TEXT[]');
      
      // Sentiment analysis
      table.string('overall_sentiment', 20);
      table.jsonb('sentiment_by_topic');
      table.jsonb('emotional_journey'); // timeline of emotions
      
      // Intent classification
      table.string('primary_intent', 100);
      table.specificType('secondary_intents', 'TEXT[]');
      table.float('intent_confidence');
      
      // Outcome
      table.string('resolution_status', 50);
      table.specificType('next_steps', 'TEXT[]');
      table.boolean('follow_up_required').defaultTo(false);
      table.timestamp('follow_up_date');
      
      // AI-generated insights
      table.text('summary');
      table.specificType('recommendations', 'TEXT[]');
      
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.index('call_id');
      table.index('customer_phone');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('call_insights')
    .dropTableIfExists('knowledge_base')
    .dropTableIfExists('customer_profiles')
    .dropTableIfExists('call_sessions')
    .dropTableIfExists('conversation_history')
    .alterTable('agents', table => {
      table.dropColumn('system_prompt');
      table.dropColumn('context_window');
      table.dropColumn('knowledge_base_ids');
      table.dropColumn('business_rules');
      table.dropColumn('conversation_style');
      table.dropColumn('special_instructions');
    });
};
