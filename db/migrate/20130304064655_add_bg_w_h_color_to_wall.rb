class AddBgWHColorToWall < ActiveRecord::Migration
  def change
    change_table(:walls) do |t|
      t.integer :w
      t.integer :h
      t.string :color
    end
  end
end
