/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    /* Columns */

    table.boolean('is_closed').notNullable().default(false);
  });

  await knex.raw(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'list' AND column_name = 'type'
      ) THEN
        UPDATE card
        SET is_closed = TRUE
        FROM list
        WHERE card.list_id = list.id AND list.type = 'closed';
      END IF;
    END;
    $$;
  `);

  // Ensure column exists then alter to NOT NULL (idempotent)
  if (await knex.schema.hasColumn('card', 'is_closed')) {
    return knex.schema.alterTable('card', (table) => {
      table.boolean('is_closed').notNullable().alter();
    });
  }
  return Promise.resolve();
};

exports.down = (knex) =>
  knex.schema.table('card', (table) => {
    table.dropColumn('is_closed');
  });
