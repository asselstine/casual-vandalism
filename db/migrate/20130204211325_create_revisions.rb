class CreateRevisions < ActiveRecord::Migration
  def change
    create_table :revisions do |t|
      t.references :wall

      t.timestamps
    end
    add_index :revisions, :wall_id
  end
end
