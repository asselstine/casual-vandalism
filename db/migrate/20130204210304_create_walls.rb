class CreateWalls < ActiveRecord::Migration
  def change
    create_table :walls do |t|
      t.string :name
      t.string :header_color
      t.references :user

      t.timestamps
    end
  end
end
