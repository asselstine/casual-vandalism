class AddImageBelongsToWall < ActiveRecord::Migration
  def change
    change_table :images do |t|
      t.references :wall
    end
  end
end
