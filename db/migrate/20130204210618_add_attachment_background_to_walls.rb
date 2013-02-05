class AddAttachmentBackgroundToWalls < ActiveRecord::Migration
  def self.up
    change_table :walls do |t|
      t.attachment :background
    end
  end

  def self.down
    drop_attached_file :walls, :background
  end
end
