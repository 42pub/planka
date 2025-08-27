/**
 * Ensure all tables created in v2 (20250228000022) have the expected columns.
 * This migration runs immediately after v2 and adds missing columns safely.
 */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  // Helper to add column if missing using safe steps for NOT NULL columns.
  // opts: { create: (t) => void, sqlType: string, notNull: boolean, backfill: any }
  const addColumnIfMissing = async (tableName, columnName, opts) => {
    const has = await knex.schema.hasColumn(tableName, columnName);
    if (has) return;

    // create the column as nullable (avoid NOT NULL on creation)
    await knex.schema.alterTable(tableName, (table) => {
      opts.create(table);
    });

    // backfill if requested
    if (opts.notNull) {
      if (opts.backfill !== undefined && opts.backfill !== null) {
        await knex(tableName).whereNull(columnName).update({ [columnName]: opts.backfill });
      }

      // set NOT NULL using raw SQL to avoid changing type unintentionally
      await knex.raw(`ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" SET NOT NULL`);
    }
  };

  // list: type (text NOT NULL), position (double precision), name, color
  await addColumnIfMissing('list', 'type', { create: (t) => t.text('type'), sqlType: 'text', notNull: true, backfill: 'kanban' });
  await addColumnIfMissing('list', 'position', { create: (t) => t.specificType('position', 'double precision'), sqlType: 'double precision' });
  await addColumnIfMissing('list', 'name', { create: (t) => t.text('name'), sqlType: 'text' });
  await addColumnIfMissing('list', 'color', { create: (t) => t.text('color'), sqlType: 'text' });

  // board: position (double precision) is NOT NULL, name, default_view, default_card_type, booleans
  await addColumnIfMissing('board', 'position', { create: (t) => t.specificType('position', 'double precision'), sqlType: 'double precision', notNull: true, backfill: 0 });
  await addColumnIfMissing('board', 'name', { create: (t) => t.text('name'), sqlType: 'text', notNull: true, backfill: '' });
  await addColumnIfMissing('board', 'default_view', { create: (t) => t.text('default_view'), sqlType: 'text', notNull: true, backfill: 'board' });
  await addColumnIfMissing('board', 'default_card_type', { create: (t) => t.text('default_card_type'), sqlType: 'text', notNull: true, backfill: 'task' });
  await addColumnIfMissing('board', 'limit_card_types_to_default_one', { create: (t) => t.boolean('limit_card_types_to_default_one'), sqlType: 'boolean', notNull: true, backfill: false });
  await addColumnIfMissing('board', 'always_display_card_creator', { create: (t) => t.boolean('always_display_card_creator'), sqlType: 'boolean', notNull: true, backfill: false });

  // label: position (double precision).name,color
  await addColumnIfMissing('label', 'position', { create: (t) => t.specificType('position', 'double precision'), sqlType: 'double precision', notNull: true, backfill: 0 });
  await addColumnIfMissing('label', 'name', { create: (t) => t.text('name'), sqlType: 'text' });
  await addColumnIfMissing('label', 'color', { create: (t) => t.text('color'), sqlType: 'text', notNull: true, backfill: '#000000' });

  // card: type (text NOT NULL), position, name, description, due_date, stopwatch
  await addColumnIfMissing('card', 'type', { create: (t) => t.text('type'), sqlType: 'text', notNull: true, backfill: 'task' });
  await addColumnIfMissing('card', 'position', { create: (t) => t.specificType('position', 'double precision'), sqlType: 'double precision' });
  await addColumnIfMissing('card', 'name', { create: (t) => t.text('name'), sqlType: 'text', notNull: true, backfill: '' });
  await addColumnIfMissing('card', 'description', { create: (t) => t.text('description'), sqlType: 'text' });
  await addColumnIfMissing('card', 'due_date', { create: (t) => t.timestamp('due_date', true), sqlType: 'timestamp' });
  await addColumnIfMissing('card', 'stopwatch', { create: (t) => t.jsonb('stopwatch'), sqlType: 'jsonb' });

  // attachment: type (text NOT NULL), data (jsonb), name
  await addColumnIfMissing('attachment', 'type', { create: (t) => t.text('type'), sqlType: 'text', notNull: true, backfill: 'attachment' });
  await addColumnIfMissing('attachment', 'data', { create: (t) => t.jsonb('data'), sqlType: 'jsonb', notNull: true, backfill: '{}' });
  await addColumnIfMissing('attachment', 'name', { create: (t) => t.text('name'), sqlType: 'text', notNull: true, backfill: '' });

  // custom_field_group: position (double precision).name
  await addColumnIfMissing('custom_field_group', 'position', { create: (t) => t.specificType('position', 'double precision'), sqlType: 'double precision', notNull: true, backfill: 0 });
  await addColumnIfMissing('custom_field_group', 'name', { create: (t) => t.text('name'), sqlType: 'text' });

  // custom_field: position,name,show_on_front_of_card
  await addColumnIfMissing('custom_field', 'position', { create: (t) => t.specificType('position', 'double precision'), sqlType: 'double precision', notNull: true, backfill: 0 });
  await addColumnIfMissing('custom_field', 'name', { create: (t) => t.text('name'), sqlType: 'text', notNull: true, backfill: '' });
  await addColumnIfMissing('custom_field', 'show_on_front_of_card', { create: (t) => t.boolean('show_on_front_of_card'), sqlType: 'boolean', notNull: true, backfill: false });

  // custom_field_value: content
  await addColumnIfMissing('custom_field_value', 'content', { create: (t) => t.text('content'), sqlType: 'text', notNull: true, backfill: '' });

  // task_list: position,name,show_on_front_of_card
  await addColumnIfMissing('task_list', 'position', { create: (t) => t.specificType('position', 'double precision'), sqlType: 'double precision', notNull: true, backfill: 0 });
  await addColumnIfMissing('task_list', 'name', { create: (t) => t.text('name'), sqlType: 'text', notNull: true, backfill: '' });
  await addColumnIfMissing('task_list', 'show_on_front_of_card', { create: (t) => t.boolean('show_on_front_of_card'), sqlType: 'boolean', notNull: true, backfill: false });

  // task: position,name,is_completed
  await addColumnIfMissing('task', 'position', { create: (t) => t.specificType('position', 'double precision'), sqlType: 'double precision', notNull: true, backfill: 0 });
  await addColumnIfMissing('task', 'name', { create: (t) => t.text('name'), sqlType: 'text', notNull: true, backfill: '' });
  await addColumnIfMissing('task', 'is_completed', { create: (t) => t.boolean('is_completed'), sqlType: 'boolean', notNull: true, backfill: false });

  // notification_service: url, format
  await addColumnIfMissing('notification_service', 'url', { create: (t) => t.text('url'), sqlType: 'text', notNull: true, backfill: '' });
  await addColumnIfMissing('notification_service', 'format', { create: (t) => t.text('format'), sqlType: 'text', notNull: true, backfill: 'json' });
};

exports.down = async (knex) => {
  // No-op: don't drop columns automatically.
};
