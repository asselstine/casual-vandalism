class AddBackgroundUrlColumnToWall < ActiveRecord::Migration
  def change
    change_table :walls do |t|
      t.string :background_url
    end
  end
end
