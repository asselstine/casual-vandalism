class CreateImages < ActiveRecord::Migration
  def change
    create_table :images do |t|
      t.integer :x
      t.integer :y

      t.timestamps
    end
  end
end
